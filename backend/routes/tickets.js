const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { auth } = require('../middleware/auth');

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Private
router.get('/', auth(), ticketController.getTickets);

// @route   GET api/tickets/stats
// @desc    Get ticket statistics
// @access  Private
router.get('/stats', auth(), ticketController.getTicketStats);

// @route   GET api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', auth(), ticketController.getTicket);

// @route   POST api/tickets
// @desc    Create a ticket
// @access  Private
router.post(
  '/',
  [
    auth(),
    [
      check('nombreApellido', 'El nombre es requerido').not().isEmpty(),
      check('piso', 'El piso es requerido').isInt({ min: 1 }),
      check('oficina', 'La oficina es requerida').not().isEmpty(),
      check('departamento', 'El departamento es requerido').isIn([
        'IT',
        'RRHH',
        'Finanzas',
        'Operaciones',
      ]),
      check('descripcion', 'La descripción es requerida (mínimo 10 caracteres)').isLength({
        min: 10,
      }),
      check('prioridad', 'La prioridad es inválida').optional().isIn([
        'Baja',
        'Media',
        'Alta',
        'Urgente',
      ]),
    ],
  ],
  ticketController.createTicket
);

// @route   PUT api/tickets/:id
// @desc    Update a ticket
// @access  Private
router.put(
  '/:id',
  [
    auth(),
    [
      check('nombreApellido', 'El nombre es requerido').optional().not().isEmpty(),
      check('piso', 'El piso debe ser un número válido').optional().isInt({ min: 1 }),
      check('oficina', 'La oficina es requerida').optional().not().isEmpty(),
      check('departamento', 'El departamento es inválido')
        .optional()
        .isIn(['IT', 'RRHH', 'Finanzas', 'Operaciones']),
      check('descripcion', 'La descripción debe tener al menos 10 caracteres')
        .optional()
        .isLength({ min: 10 }),
      check('prioridad', 'La prioridad es inválida')
        .optional()
        .isIn(['Baja', 'Media', 'Alta', 'Urgente']),
      check('estatus', 'El estatus es inválido')
        .optional()
        .isIn(['Nuevo', 'En Progreso', 'Resuelto', 'Cerrado']),
    ],
  ],
  ticketController.updateTicket
);

// @route   DELETE api/tickets/:id
// @desc    Delete a ticket
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), ticketController.deleteTicket);

module.exports = router;
