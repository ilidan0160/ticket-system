const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// @route   GET api/chat/ticket/:ticketId
// @desc    Get chat messages for a ticket
// @access  Private
router.get('/ticket/:ticketId', auth(), chatController.getChatMessages);

// @route   POST api/chat/message
// @desc    Send a message in a ticket chat
// @access  Private
router.post(
  '/message',
  [
    auth(),
    [
      check('ticketId', 'El ID del ticket es requerido').isInt(),
      check('message', 'El mensaje no puede estar vacío').not().isEmpty(),
      check('isInternal', 'isInternal debe ser un booleano').optional().isBoolean(),
    ],
  ],
  chatController.sendMessage
);

// @route   PUT api/chat/message/:messageId
// @desc    Update a message
// @access  Private
router.put(
  '/message/:messageId',
  [
    auth(),
    [
      check('message', 'El mensaje no puede estar vacío').not().isEmpty(),
    ],
  ],
  chatController.updateMessage
);

// @route   DELETE api/chat/message/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/message/:messageId', auth(), chatController.deleteMessage);

module.exports = router;
