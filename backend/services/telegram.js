const { Telegraf } = require('telegraf');
const { Ticket, User } = require('../models');
const logger = require('../utils/logger');

let bot = null;

// Format ticket information for Telegram
const formatTicketMessage = (ticket) => {
  return `
🎫 *Nuevo Ticket #${ticket.id}*\n\
*Solicitante:* ${ticket.nombreApellido}\
*Departamento:* ${ticket.departamento}\
*Piso/Oficina:* Piso ${ticket.piso}, ${ticket.oficina}\
*Prioridad:* ${ticket.prioridad}\
*Estado:* ${ticket.estatus}\
\
*Descripción:*\
${ticket.descripcion}\n\
[Ver en el sistema](${process.env.FRONTEND_URL}/tickets/${ticket.id})
  `;
};

// Initialize Telegram bot
const setupTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN not set. Telegram bot will not be started.');
    return null;
  }

  try {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    
    // Start command
    bot.start((ctx) => {
      ctx.reply(
        `👋 ¡Hola! Soy el bot de notificaciones del sistema de tickets.\n\
Puedes usar los siguientes comandos:\
/mistickets - Ver tus tickets asignados\
/ayuda - Mostrar esta ayuda`
      );
    });

    // Help command
    bot.help((ctx) => {
      ctx.reply(
        `📋 *Comandos disponibles:*\n\
/start - Iniciar el bot\
/mistickets - Ver tus tickets asignados\
/ayuda - Mostrar ayuda`,
        { parse_mode: 'Markdown' }
      );
    });

    // List assigned tickets
    bot.command('mistickets', async (ctx) => {
      try {
        // Find user by Telegram username or ID
        const user = await User.findOne({
          where: {
            telegramId: ctx.from.id.toString(),
          },
        });

        if (!user) {
          return ctx.reply(
            '🔒 No estás registrado en el sistema. Por favor, inicia sesión en la web para vincular tu cuenta de Telegram.'
          );
        }

        const tickets = await Ticket.findAll({
          where: { assignedTo: user.id },
          order: [['createdAt', 'DESC']],
          limit: 10,
        });

        if (tickets.length === 0) {
          return ctx.reply('No tienes tickets asignados.');
        }

        let response = `📋 *Tus tickets asignados (${tickets.length})*\n\n`;
        
        tickets.forEach((ticket) => {
          response += `*#${ticket.id}* - ${ticket.estatus} - ${ticket.prioridad}\
`;
          response += `📌 ${ticket.descripcion.substring(0, 50)}...\n`;
          response += `🔗 [Ver en el sistema](${process.env.FRONTEND_URL}/tickets/${ticket.id})\n\n`;
        });

        ctx.reply(response, { parse_mode: 'Markdown', disable_web_page_preview: true });
      } catch (error) {
        logger.error('Error in /mistickets command:', error);
        ctx.reply('❌ Ocurrió un error al obtener tus tickets.');
      }
    });

    // Handle text messages
    bot.on('text', (ctx) => {
      ctx.reply(
        'No entiendo ese comando. Usa /ayuda para ver los comandos disponibles.'
      );
    });

    // Start polling
    bot.launch().then(() => {
      logger.info('Telegram bot started');
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
  } catch (error) {
    logger.error('Error setting up Telegram bot:', error);
    return null;
  }
};

// Send notification to user about new ticket
const notifyNewTicket = async (ticket) => {
  if (!bot) return;

  try {
    // Find all technicians and admins
    const users = await User.findAll({
      where: {
        telegramId: {
          [Op.ne]: null,
        },
        [Op.or]: [
          { role: 'tecnico' },
          { role: 'admin' },
        ],
      },
    });

    if (users.length === 0) return;

    const message = formatTicketMessage(ticket);
    
    // Send notification to each user
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        });
      } catch (error) {
        logger.error(`Error sending Telegram message to user ${user.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in notifyNewTicket:', error);
  }
};

// Send notification to assigned user
const notifyAssignedUser = async (ticket) => {
  if (!bot || !ticket.assignedTo) return;

  try {
    const user = await User.findByPk(ticket.assignedTo);
    
    if (!user || !user.telegramId) return;

    const message = `📌 *Has sido asignado a un ticket*\n\
` +
      `Ticket #${ticket.id} - ${ticket.prioridad}\
` +
      `📝 ${ticket.descripcion.substring(0, 100)}...\n\
` +
      `[Ver en el sistema](${process.env.FRONTEND_URL}/tickets/${ticket.id})`;

    await bot.telegram.sendMessage(user.telegramId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });
  } catch (error) {
    logger.error('Error in notifyAssignedUser:', error);
  }
};

// Link Telegram account to user
const linkTelegramAccount = async (userId, telegramId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return false;

    user.telegramId = telegramId.toString();
    await user.save();
    return true;
  } catch (error) {
    logger.error('Error linking Telegram account:', error);
    return false;
  }
};

module.exports = {
  setupTelegramBot,
  notifyNewTicket,
  notifyAssignedUser,
  linkTelegramAccount,
};
