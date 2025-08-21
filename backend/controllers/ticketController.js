const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Ticket, ChatMessage, User } = require('../models');
const logger = require('../utils/logger');

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, department, assignedTo, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    // Filter by status
    if (status) {
      where.estatus = status;
    }
    
    // Filter by priority
    if (priority) {
      where.prioridad = priority;
    }
    
    // Filter by department
    if (department) {
      where.departamento = department;
    }
    
    // Filter by assigned user
    if (assignedTo) {
      where.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }
    
    // Search in title and description
    if (search) {
      where[Op.or] = [
        { nombreApellido: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } },
        { oficina: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    // For regular users, only show their own tickets
    if (req.user.role === 'usuario') {
      where.userId = req.user.id;
    }
    
    // For technicians, show their assigned tickets and unassigned tickets
    if (req.user.role === 'tecnico') {
      where[Op.or] = [
        { assignedTo: req.user.id },
        { assignedTo: null }
      ];
    }
    
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where,
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
        { association: 'assignedUser', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    
    res.json({
      tickets,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    logger.error('Error getting tickets:', err);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
        { association: 'assignedUser', attributes: ['id', 'username', 'email'] },
        {
          association: 'messages',
          include: [
            { association: 'user', attributes: ['id', 'username', 'email', 'role'] },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }

    // Check if user has permission to view this ticket
    if (
      req.user.role === 'usuario' && 
      ticket.userId !== req.user.id && 
      ticket.assignedTo !== req.user.id
    ) {
      return res.status(403).json({ msg: 'No autorizado para ver este ticket' });
    }

    res.json(ticket);
  } catch (err) {
    logger.error('Error getting ticket:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};

// @route   POST api/tickets
// @desc    Create a ticket
// @access  Private
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      nombreApellido, 
      piso, 
      oficina, 
      departamento, 
      descripcion, 
      prioridad = 'Media' 
    } = req.body;

    // Create ticket
    const ticket = await Ticket.create({
      nombreApellido,
      piso,
      oficina,
      departamento,
      descripcion,
      prioridad,
      userId: req.user.id,
      estatus: 'Nuevo',
    });

    // Emit new ticket event
    if (req.io) {
      req.io.emit('ticket:created', ticket);
    }

    // Get the full ticket with user data
    const newTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
        { association: 'assignedUser', attributes: ['id', 'username', 'email'] },
      ],
    });

    res.status(201).json(newTicket);
  } catch (err) {
    logger.error('Error creating ticket:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/tickets/:id
// @desc    Update a ticket
// @access  Private
exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }

    // Check if user has permission to update this ticket
    if (
      req.user.role === 'usuario' && 
      ticket.userId !== req.user.id
    ) {
      return res.status(403).json({ msg: 'No autorizado para actualizar este ticket' });
    }

    const {
      nombreApellido,
      piso,
      oficina,
      departamento,
      descripcion,
      prioridad,
      estatus,
      notasInternas,
      assignedTo,
    } = req.body;

    // Build ticket object
    const ticketFields = {};
    if (nombreApellido) ticketFields.nombreApellido = nombreApellido;
    if (piso) ticketFields.piso = piso;
    if (oficina) ticketFields.oficina = oficina;
    if (departamento) ticketFields.departamento = departamento;
    if (descripcion) ticketFields.descripcion = descripcion;
    if (prioridad) ticketFields.prioridad = prioridad;
    if (notasInternas !== undefined) ticketFields.notasInternas = notasInternas;
    
    // Only allow changing status and assignment for technicians and admins
    if (['tecnico', 'admin'].includes(req.user.role)) {
      if (estatus) ticketFields.estatus = estatus;
      if (assignedTo !== undefined) ticketFields.assignedTo = assignedTo || null;
      
      // If status is changed to 'Cerrado' or 'Resuelto', set fechaCierre
      if (['Cerrado', 'Resuelto'].includes(estatus) && !ticket.fechaCierre) {
        ticketFields.fechaCierre = new Date();
      }
    }

    // Update ticket
    await ticket.update(ticketFields);
    
    // Get the updated ticket with user data
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
        { association: 'assignedUser', attributes: ['id', 'username', 'email'] },
      ],
    });

    // Emit ticket updated event
    if (req.io) {
      req.io.emit('ticket:updated', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (err) {
    logger.error('Error updating ticket:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   DELETE api/tickets/:id
// @desc    Delete a ticket
// @access  Private (Admin only)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket no encontrado' });
    }

    // Only admin can delete tickets
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No autorizado para eliminar tickets' });
    }

    await ticket.destroy();

    // Emit ticket deleted event
    if (req.io) {
      req.io.emit('ticket:deleted', { id: ticket.id });
    }

    res.json({ msg: 'Ticket eliminado' });
  } catch (err) {
    logger.error('Error deleting ticket:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/tickets/stats
// @desc    Get ticket statistics
// @access  Private
exports.getTicketStats = async (req, res) => {
  try {
    const where = {};
    
    // For regular users, only show their own tickets
    if (req.user.role === 'usuario') {
      where.userId = req.user.id;
    }
    
    // For technicians, show their assigned tickets
    if (req.user.role === 'tecnico') {
      where.assignedTo = req.user.id;
    }
    
    // Get counts by status
    const statusCounts = await Ticket.findAll({
      attributes: ['estatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['estatus'],
      raw: true,
    });
    
    // Get counts by priority
    const priorityCounts = await Ticket.findAll({
      attributes: ['prioridad', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['prioridad'],
      raw: true,
    });
    
    // Get counts by department
    const departmentCounts = await Ticket.findAll({
      attributes: ['departamento', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['departamento'],
      raw: true,
    });
    
    // Format the data for the frontend
    const stats = {
      status: {},
      priority: {},
      department: {},
      total: 0,
    };
    
    statusCounts.forEach(({ estatus, count }) => {
      stats.status[estatus] = parseInt(count);
      stats.total += parseInt(count);
    });
    
    priorityCounts.forEach(({ prioridad, count }) => {
      stats.priority[prioridad] = parseInt(count);
    });
    
    departmentCounts.forEach(({ departamento, count }) => {
      stats.department[departamento] = parseInt(count);
    });
    
    res.json(stats);
  } catch (err) {
    logger.error('Error getting ticket stats:', err);
    res.status(500).send('Error del servidor');
  }
};
