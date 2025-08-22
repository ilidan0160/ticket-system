const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Ticket, ChatMessage, User } = require('../models');
const logger = require('../utils/logger');
const axios = require('axios');
const statsHelper = require('../utils/statsHelper');

// Obtener instancia de sequelize
const sequelize = require('../config/database');

// Función para enviar notificaciones por Telegram
async function sendTelegramMessage(message) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return;
  }
  
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    await axios.post(url, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    logger.error('Error al enviar mensaje por Telegram', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
}

// Tipos de prioridad y estado para validación
const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'];
const ESTADOS = ['abierto', 'en_progreso', 'pendiente', 'resuelto', 'cerrado'];
const DEPARTAMENTOS = ['IT', 'RRHH', 'Finanzas', 'Operaciones'];

// @route   GET api/tickets
// @desc    Get all tickets with pagination and filters
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    // Validar parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Límite máximo de 100
    const offset = (page - 1) * limit;
    
    // Construir cláusula where
    const where = {};
    
    // Filtrar por estado
    if (req.query.status) {
      if (!ESTADOS.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido',
          errors: { status: `El estado debe ser uno de: ${ESTADOS.join(', ')}` }
        });
      }
      where.estatus = req.query.status;
    }
    
    // Filtrar por prioridad
    if (req.query.priority) {
      if (!PRIORIDADES.includes(req.query.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Prioridad no válida',
          errors: { priority: `La prioridad debe ser una de: ${PRIORIDADES.join(', ')}` }
        });
      }
      where.prioridad = req.query.priority;
    }
    
    // Filtrar por departamento
    if (req.query.department) {
      if (!DEPARTAMENTOS.includes(req.query.department)) {
        return res.status(400).json({
          success: false,
          message: 'Departamento no válido',
          errors: { department: `El departamento debe ser uno de: ${DEPARTAMENTOS.join(', ')}` }
        });
      }
      where.departamento = req.query.department;
    }
    
    // Filtrar por usuario asignado
    if (req.query.assignedTo) {
      if (req.query.assignedTo === 'unassigned') {
        where.assignedTo = null;
      } else if (!isNaN(parseInt(req.query.assignedTo))) {
        where.assignedTo = parseInt(req.query.assignedTo);
      } else {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario asignado no válido',
          errors: { assignedTo: 'Debe ser un ID numérico o "unassigned"' }
        });
      }
    }
    
    // Búsqueda en nombre, descripción y oficina
    if (req.query.search) {
      where[Op.or] = [
        { nombreApellido: { [Op.iLike]: `%${req.query.search}%` } },
        { descripcion: { [Op.iLike]: `%${req.query.search}%` } },
        { oficina: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    
    // Los usuarios normales solo ven sus propios tickets
    if (req.user.role === 'usuario') {
      where.userId = req.user.id;
    }
    
    // Los técnicos ven los tickets asignados a ellos y los no asignados
    if (req.user.role === 'tecnico') {
      where[Op.or] = [
        { assignedTo: req.user.id },
        { assignedTo: null }
      ];
    }
    
    // Obtener tickets con información de usuario
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'email', 'role'] 
        },
        { 
          model: User, 
          as: 'assignedToUser', 
          attributes: ['id', 'username', 'email', 'role'] 
        }
      ]
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(count / limit);

    // Validar si la página solicitada es válida
    if (page > 1 && page > totalPages) {
      return res.status(400).json({
        success: false,
        message: 'Página no válida',
        errors: { page: `La página ${page} no existe. Máximo ${totalPages} páginas.` }
      });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      data: tickets,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (err) {
    logger.error('Error al obtener tickets:', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      query: req.query
    });
    
    // Manejar diferentes tipos de errores
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Error de base de datos',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error al procesar la solicitud'
      });
    }
    
    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.reduce((acc, error) => ({
        ...acc,
        [error.path]: error.message
      }), {});
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }
    
    // Error general del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET api/tickets/:id
// @desc    Obtener un ticket por su ID
// @access  Privado
exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número válido
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de ticket no válido',
        errors: { id: 'El ID debe ser un número' }
      });
    }

    // Buscar el ticket con sus relaciones
    const ticket = await Ticket.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'email', 'role'] 
        },
        { 
          model: User, 
          as: 'assignedToUser', 
          attributes: ['id', 'username', 'email', 'role'] 
        },
        { 
          model: ChatMessage, 
          as: 'messages',
          include: [
            { 
              model: User, 
              attributes: ['id', 'username', 'email', 'role'] 
            }
          ],
          order: [['createdAt', 'ASC']],
          required: false // Hacer el join opcional
        }
      ]
    });

    // Verificar si el ticket existe
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado',
        errors: { id: `No se encontró un ticket con el ID ${id}` }
      });
    }

    // Verificar permisos de usuario
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      logger.warn('Intento de acceso no autorizado a ticket', {
        userId: req.user.id,
        ticketId: id,
        ticketOwner: ticket.userId
      });
      
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        errors: { 
          authorization: 'No tiene permisos para ver este ticket' 
        }
      });
    }

    // Los técnicos solo pueden ver tickets asignados a ellos o no asignados
    if (req.user.role === 'tecnico' && 
        ticket.assignedTo !== null && 
        ticket.assignedTo !== req.user.id) {
      logger.warn('Intento de acceso de técnico a ticket no asignado', {
        technicianId: req.user.id,
        ticketId: id,
        assignedTo: ticket.assignedTo
      });
      
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        errors: { 
          authorization: 'Solo puede ver tickets asignados a usted' 
        }
      });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      data: ticket
    });
    
  } catch (err) {
    // Registrar el error con más contexto
    logger.error('Error al obtener ticket', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      ticketId: req.params.id
    });
    
    // Manejar diferentes tipos de errores
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Error de base de datos',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    // Error general del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   POST api/tickets
// @desc    Crear un nuevo ticket
// @access  Privado
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  
  // Validar campos requeridos
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => ({
      ...acc,
      [error.param]: error.msg
    }), {});
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errorMessages
    });
  }
  
  // Validar que el usuario existe y está activo
  const user = await User.findByPk(req.user.id);
  if (!user || !user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'No autorizado',
      errors: { user: 'Usuario no encontrado o inactivo' }
    });
  }

  try {
    const { 
      nombreApellido, 
      piso, 
      oficina, 
      departamento, 
      descripcion, 
      prioridad = 'Media',
      categoria = 'General'
    } = req.body;
    
    // Validar prioridad
    if (!PRIORIDADES.includes(prioridad)) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: { 
          prioridad: `La prioridad debe ser una de: ${PRIORIDADES.join(', ')}` 
        }
      });
    }
    
    // Validar departamento
    if (!DEPARTAMENTOS.includes(departamento)) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: { 
          departamento: `El departamento debe ser uno de: ${DEPARTAMENTOS.join(', ')}` 
        }
      });
    }
    
    // Validar piso (debe ser un número positivo)
    const pisoNum = parseInt(piso);
    if (isNaN(pisoNum) || pisoNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: { 
          piso: 'El piso debe ser un número mayor a 0' 
        }
      });
    }

    // Crear el ticket en una transacción para asegurar la integridad de los datos
    const transaction = await sequelize.transaction();
    
    try {
      // Crear nuevo ticket
      const ticket = await Ticket.create({
        nombreApellido: nombreApellido.trim(),
        piso: pisoNum,
        oficina: oficina.trim(),
        departamento,
        descripcion: descripcion.trim(),
        prioridad,
        categoria: categoria.trim(),
        userId: req.user.id,
        estatus: 'abierto',
        assignedTo: null
      }, { transaction });
      
      // Obtener el ticket con la información del usuario
      const newTicket = await Ticket.findByPk(ticket.id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'username', 'email', 'role'] 
          }
        ],
        transaction
      });
      
      // Confirmar la transacción
      await transaction.commit();
      
      // Registrar la creación del ticket
      logger.info('Nuevo ticket creado', {
        ticketId: newTicket.id,
        userId: req.user.id,
        prioridad: newTicket.prioridad,
        departamento: newTicket.departamento
      });
      
      // Emitir evento de nuevo ticket a través de WebSocket
      if (req.app.get('io')) {
        req.app.get('io').emit('ticket:created', newTicket);
      }
      
      // Enviar notificación por Telegram (si está configurado)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          const telegramMessage = `
          🎫 *Nuevo Ticket Creado* 🎫
          
          *Asunto:* ${newTicket.nombreApellido}
          *Departamento:* ${newTicket.departamento}
          *Prioridad:* ${newTicket.prioridad}
          *Piso/Oficina:* ${newTicket.piso} - ${newTicket.oficina}
          
          _${newTicket.descripcion.substring(0, 100)}${newTicket.descripcion.length > 100 ? '...' : ''}_
          
          [Ver ticket](${process.env.FRONTEND_URL}/tickets/${newTicket.id})
          `;
          
          await sendTelegramMessage(telegramMessage);
        } catch (telegramError) {
          logger.error('Error al enviar notificación por Telegram', {
            error: telegramError.message,
            ticketId: newTicket.id
          });
        }
      }
      
      // Respuesta exitosa
      res.status(201).json({
        success: true,
        message: 'Ticket creado exitosamente',
        data: newTicket
      });
      
    } catch (dbError) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      
      // Manejar errores de base de datos
      if (dbError.name === 'SequelizeValidationError' || dbError.name === 'SequelizeUniqueConstraintError') {
        const errors = dbError.errors.reduce((acc, error) => ({
          ...acc,
          [error.path]: error.message
        }), {});
        
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors
        });
      }
      
      // Registrar error inesperado
      logger.error('Error al crear ticket', {
        error: dbError.message,
        stack: dbError.stack,
        userId: req.user.id,
        body: req.body
      });
      
      throw dbError; // Será capturado por el catch externo
    }
  } catch (err) {
    logger.error('Error creating ticket:', err);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/tickets/:id
// @desc    Actualizar un ticket existente
// @access  Privado
exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Validar que el ID sea un número válido
  if (isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID de ticket no válido',
      errors: { id: 'El ID debe ser un número' }
    });
  }
  
  // Validar campos permitidos para actualización
  const allowedUpdates = [
    'nombreApellido', 'piso', 'oficina', 'departamento', 
    'descripcion', 'prioridad', 'estatus', 'assignedTo', 'categoria'
  ];
  
  const isValidOperation = Object.keys(updates).every(update => 
    allowedUpdates.includes(update)
  );
  
  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: { 
        updates: `Solo se permiten actualizaciones en: ${allowedUpdates.join(', ')}` 
      }
    });
  }
  
  // Validar prioridad si está presente
  if (updates.prioridad && !PRIORIDADES.includes(updates.prioridad)) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: { 
        prioridad: `La prioridad debe ser una de: ${PRIORIDADES.join(', ')}` 
      }
    });
  }
  
  // Validar estado si está presente
  if (updates.estatus && !ESTADOS.includes(updates.estatus)) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: { 
        estatus: `El estado debe ser uno de: ${ESTADOS.join(', ')}` 
      }
    });
  }
  
  // Validar departamento si está presente
  if (updates.departamento && !DEPARTAMENTOS.includes(updates.departamento)) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: { 
        departamento: `El departamento debe ser uno de: ${DEPARTAMENTOS.join(', ')}` 
      }
    });
  }
  
  // Validar piso si está presente
  if (updates.piso !== undefined) {
    const pisoNum = parseInt(updates.piso);
    if (isNaN(pisoNum) || pisoNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: { 
          piso: 'El piso debe ser un número mayor a 0' 
        }
      });
    }
    updates.piso = pisoNum; // Asegurar que sea un número
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Iniciar transacción para asegurar la integridad de los datos
  const transaction = await sequelize.transaction();
  
  try {
    // Buscar el ticket con bloqueo para evitar condiciones de carrera
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'assignedToUser', attributes: ['id', 'username', 'email'] }
      ],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    // Verificar si el ticket existe
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado',
        errors: { id: `No se encontró un ticket con el ID ${id}` }
      });
    }

    // Verificar permisos del usuario
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      await transaction.rollback();
      logger.warn('Intento de actualización no autorizado', {
        userId: req.user.id,
        ticketId: id,
        ticketOwner: ticket.userId,
        action: 'update'
      });
      
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        errors: { 
          authorization: 'Solo puede actualizar sus propios tickets' 
        }
      });
    }
    
    // Si se está reasignando el ticket, verificar que el usuario asignado exista
    if (updates.assignedTo) {
      const assignedUser = await User.findByPk(updates.assignedTo, { transaction });
      if (!assignedUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: { 
            assignedTo: 'El usuario asignado no existe' 
          }
        });
      }
      
      // Si el usuario asignado es el mismo que el actual, no hacer nada
      if (ticket.assignedTo === updates.assignedTo) {
        delete updates.assignedTo;
      } else {
        // Registrar el cambio de asignación
        logger.info('Cambio de asignación de ticket', {
          ticketId: ticket.id,
          previousAssignedTo: ticket.assignedTo,
          newAssignedTo: updates.assignedTo,
          updatedBy: req.user.id
        });
      }
    }
    
    // Si se está cerrando el ticket, establecer la fecha de cierre
    if (updates.estatus && ['Cerrado', 'Resuelto'].includes(updates.estatus) && !ticket.fechaCierre) {
      updates.fechaCierre = new Date();
    }
    
    // Actualizar el ticket
    await ticket.update(updates, { transaction });
    
    // Obtener el ticket actualizado con relaciones
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'assignedToUser', attributes: ['id', 'username', 'email'] }
      ],
      transaction
    });
    
    // Confirmar la transacción
    await transaction.commit();
    
    // Registrar la actualización
    logger.info('Ticket actualizado', {
      ticketId: updatedTicket.id,
      updatedBy: req.user.id,
      changes: Object.keys(updates)
    });
    
    // Emitir evento de actualización a través de WebSocket
    if (req.app.get('io')) {
      req.app.get('io').emit('ticket:updated', updatedTicket);
    }
    
    // Enviar notificación por Telegram si se reasignó el ticket
    if (updates.assignedTo && ticket.assignedTo !== updates.assignedTo) {
      try {
        const assignedToUser = await User.findByPk(updates.assignedTo);
        if (assignedToUser) {
          const message = `
          🔄 *Ticket Reasignado* 🔄
          
          *Ticket #${updatedTicket.id}*
          *Asunto:* ${updatedTicket.nombreApellido}
          *Prioridad:* ${updatedTicket.prioridad}
          *Estado:* ${updatedTicket.estatus}
          
          Has sido asignado a este ticket.
          
          [Ver ticket](${process.env.FRONTEND_URL || 'http://localhost:3000'}/tickets/${updatedTicket.id})
          `;
          
          await sendTelegramMessage(message);
        }
      } catch (telegramError) {
        logger.error('Error al enviar notificación de reasignación por Telegram', {
          error: telegramError.message,
          ticketId: updatedTicket.id,
          assignedTo: updates.assignedTo
        });
      }
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Ticket actualizado exitosamente',
      data: updatedTicket
    });
    
  } catch (err) {
    // Revertir la transacción en caso de error
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    
    // Manejar errores específicos
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.reduce((acc, error) => ({
        ...acc,
        [error.path]: error.message
      }), {});
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }
    
    // Registrar error inesperado
    logger.error('Error al actualizar ticket', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      ticketId: id,
      updates: Object.keys(updates)
    });
    
    // Error general del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el ticket',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   DELETE api/tickets/:id
// @desc    Eliminar un ticket (solo administradores)
// @access  Privado (solo administradores)
exports.deleteTicket = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  
  try {
    // Buscar el ticket con bloqueo para evitar condiciones de carrera
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    // Verificar si el ticket existe
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado',
        errors: { id: `No se encontró un ticket con el ID ${id}` }
      });
    }

    // Verificar permisos (solo administradores pueden eliminar tickets)
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      logger.warn('Intento de eliminación no autorizado', {
        userId: req.user.id,
        ticketId: id,
        userRole: req.user.role
      });
      
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        errors: { 
          authorization: 'Solo los administradores pueden eliminar tickets' 
        }
      });
    }
    
    // Registrar información del ticket antes de eliminarlo
    const ticketData = ticket.get({ plain: true });
    
    // Eliminar el ticket
    await ticket.destroy({ transaction });
    
    // Confirmar la transacción
    await transaction.commit();
    
    // Registrar la eliminación
    logger.info('Ticket eliminado', {
      ticketId: id,
      deletedBy: req.user.id,
      ticketData: {
        userId: ticketData.userId,
        status: ticketData.estatus,
        priority: ticketData.prioridad,
        assignedTo: ticketData.assignedTo
      }
    });
    
    // Emitir evento de eliminación a través de WebSocket
    if (req.app.get('io')) {
      req.app.get('io').emit('ticket:deleted', { 
        id: ticket.id,
        deletedBy: req.user.id 
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Ticket eliminado exitosamente',
      data: { id: ticket.id }
    });
    
  } catch (err) {
    // Revertir la transacción en caso de error
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    
    // Manejar errores específicos
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el ticket',
        errors: { 
          constraint: 'El ticket tiene registros relacionados que deben eliminarse primero' 
        }
      });
    }
    
    // Registrar error inesperado
    logger.error('Error al eliminar ticket', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      ticketId: id
    });
    
    // Error general del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el ticket',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Cache TTL en segundos (5 minutos)
const CACHE_TTL = 300;

// @route   GET api/tickets/stats
// @desc    Obtener estadísticas de tickets con consultas optimizadas
// @access  Privado
exports.getTicketStats = async (req, res) => {
  const cacheKey = `stats:${req.user.id}:${req.user.role}`;
  
  try {
    // Construir condiciones de consulta basadas en el rol del usuario
    const where = {};
    
    // Para usuarios regulares, solo mostrar sus propios tickets
    if (req.user.role === 'usuario') {
      where.userId = req.user.id;
    } 
    // Para técnicos, mostrar tickets asignados a ellos
    else if (req.user.role === 'tecnico') {
      where.assignedTo = req.user.id;
    }
    
    // Verificar caché primero
    const cachedData = await req.app.locals.cache?.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Iniciar transacción para consistencia de datos
    const transaction = await sequelize.transaction();
    
    try {
      // Obtener todas las estadísticas en paralelo
      const [
        basicStats,
        assignmentStats,
        trendData,
        dailyAverage
      ] = await Promise.all([
        statsHelper.getBasicStats(where, transaction),
        ['admin', 'tecnico'].includes(req.user.role) 
          ? statsHelper.getAssignmentStats(where, transaction) 
          : [],
        statsHelper.getTrendData(where, transaction),
        statsHelper.getDailyAverage(where, transaction)
      ]);
      
      // Confirmar la transacción
      await transaction.commit();
      
      // Formatear la respuesta
      const stats = {
        summary: {
          total: basicStats.total,
          open: basicStats.open,
          inProgress: basicStats.inProgress,
          closed: basicStats.closed,
          dailyAverage: parseFloat(dailyAverage)
        },
        byStatus: basicStats.byStatus,
        byPriority: basicStats.byPriority,
        byDepartment: basicStats.byDepartment,
        resolutionTime: {
          hours: basicStats.avgResolutionHours.toFixed(1),
          days: (basicStats.avgResolutionHours / 24).toFixed(1)
        },
        activity: {
          trend: trendData,
          last30Days: Math.round(parseFloat(dailyAverage) * 30),
          dailyAverage: parseFloat(dailyAverage)
        },
        assignments: assignmentStats
      };
      
      // Almacenar en caché
      if (req.app.locals.cache) {
        await req.app.locals.cache.set(
          cacheKey, 
          JSON.stringify({
            success: true,
            data: stats,
            generatedAt: new Date().toISOString()
          }),
          'EX', 
          statsHelper.CACHE_TTL
        );
      }
      
      res.json({
        success: true,
        data: stats,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      // Revertir la transacción en caso de error
      if (transaction.finished !== 'commit') {
        await transaction.rollback();
      }
      
      logger.error('Error en getTicketStats:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        role: req.user?.role
      });
      
      // Intentar devolver datos en caché si están disponibles, incluso si están desactualizados
      const staleData = await req.app.locals.cache?.get(cacheKey);
      if (staleData) {
        logger.warn('Sirviendo datos en caché debido a un error', { userId: req.user?.id });
        return res.json(JSON.parse(staleData));
      }
      
      throw error; // Lanzar el error para que lo maneje el bloque catch externo
    }
  } catch (error) {
    logger.error('Error crítico en getTicketStats:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
