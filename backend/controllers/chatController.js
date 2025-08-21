const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { ChatMessage, Ticket, User } = require('../models');
const logger = require('../utils/logger');

// @route   GET api/chat/ticket/:ticketId
// @desc    Get chat messages for a ticket
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Check if user has access to this ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }
    
    // Check permissions
    if (
      req.user.role === 'usuario' && 
      ticket.userId !== req.user.id && 
      ticket.assignedTo !== req.user.id
    ) {
      return res.status(403).json({ msg: 'No autorizado para ver este chat' });
    }
    
    // Get messages
    const messages = await ChatMessage.findAll({
      where: { ticketId },
      include: [
        { 
          association: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ],
      order: [['createdAt', 'ASC']],
    });
    
    res.json(messages);
  } catch (err) {
    logger.error('Error getting chat messages:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   POST api/chat/message
// @desc    Send a message in a ticket chat
// @access  Private
exports.sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { ticketId, message, isInternal = false } = req.body;
    
    // Check if ticket exists
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }
    
    // Check permissions
    if (
      req.user.role === 'usuario' && 
      ticket.userId !== req.user.id &&
      !isInternal // Only allow internal messages for techs/admins
    ) {
      return res.status(403).json({ msg: 'No autorizado para enviar mensajes en este chat' });
    }
    
    // Create message
    const chatMessage = await ChatMessage.create({
      mensaje: message,
      isInternal: req.user.role === 'usuario' ? false : isInternal,
      ticketId,
      userId: req.user.id,
    });
    
    // Get the full message with user data
    const fullMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { 
          association: 'user',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          association: 'ticket',
          attributes: ['id', 'estatus', 'assignedTo'],
          include: [
            { 
              association: 'assignedUser',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });
    
    // Emit new message event
    if (req.io) {
      req.io.to(`ticket_${ticketId}`).emit('chat:new_message', fullMessage);
      
      // Notify assigned user if message is from requester
      if (ticket.assignedTo && ticket.assignedTo !== req.user.id) {
        req.io.to(`user_${ticket.assignedTo}`).emit('chat:notification', {
          ticketId,
          message: `Nuevo mensaje en ticket #${ticketId}`,
          from: req.user.username
        });
      }
      // Notify requester if message is from technician/admin
      else if (ticket.userId !== req.user.id) {
        req.io.to(`user_${ticket.userId}`).emit('chat:notification', {
          ticketId,
          message: `Nuevo mensaje en ticket #${ticketId}`,
          from: req.user.username
        });
      }
    }
    
    res.status(201).json(fullMessage);
  } catch (err) {
    logger.error('Error sending message:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/chat/message/:messageId
// @desc    Update a message
// @access  Private
exports.updateMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { messageId } = req.params;
    const { message } = req.body;
    
    // Find the message
    const chatMessage = await ChatMessage.findByPk(messageId, {
      include: [
        {
          association: 'ticket',
          attributes: ['id', 'userId', 'assignedTo']
        }
      ]
    });
    
    if (!chatMessage) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' });
    }
    
    // Check permissions
    if (
      chatMessage.userId !== req.user.id && 
      req.user.role !== 'admin' && 
      !(req.user.role === 'tecnico' && chatMessage.ticket.assignedTo === req.user.id)
    ) {
      return res.status(403).json({ msg: 'No autorizado para editar este mensaje' });
    }
    
    // Update message
    chatMessage.mensaje = message;
    await chatMessage.save();
    
    // Emit message updated event
    if (req.io) {
      req.io.to(`ticket_${chatMessage.ticketId}`).emit('chat:message_updated', {
        id: chatMessage.id,
        mensaje: chatMessage.mensaje,
        updatedAt: chatMessage.updatedAt
      });
    }
    
    res.json(chatMessage);
  } catch (err) {
    logger.error('Error updating message:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   DELETE api/chat/message/:messageId
// @desc    Delete a message
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find the message
    const chatMessage = await ChatMessage.findByPk(messageId, {
      include: [
        {
          association: 'ticket',
          attributes: ['id', 'userId', 'assignedTo']
        }
      ]
    });
    
    if (!chatMessage) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' });
    }
    
    // Check permissions
    if (
      chatMessage.userId !== req.user.id && 
      req.user.role !== 'admin' && 
      !(req.user.role === 'tecnico' && chatMessage.ticket.assignedTo === req.user.id)
    ) {
      return res.status(403).json({ msg: 'No autorizado para eliminar este mensaje' });
    }
    
    const ticketId = chatMessage.ticketId;
    await chatMessage.destroy();
    
    // Emit message deleted event
    if (req.io) {
      req.io.to(`ticket_${ticketId}`).emit('chat:message_deleted', {
        id: messageId,
        ticketId
      });
    }
    
    res.json({ msg: 'Mensaje eliminado' });
  } catch (err) {
    logger.error('Error deleting message:', err);
    res.status(500).send('Error del servidor');
  }
};
