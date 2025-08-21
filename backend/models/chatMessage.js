const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000],
      },
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_internal',
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ticket_id',
      references: {
        model: 'tickets',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    tableName: 'mensajes_chat',
    defaultScope: {
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'ASC']],
    },
  });

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket',
      onDelete: 'CASCADE',
    });
    
    ChatMessage.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return ChatMessage;
};
