const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreApellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre_apellido',
      validate: {
        notEmpty: true,
      },
    },
    piso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    oficina: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    departamento: {
      type: DataTypes.ENUM('IT', 'RRHH', 'Finanzas', 'Operaciones'),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 2000],
      },
    },
    prioridad: {
      type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Urgente'),
      defaultValue: 'Media',
      allowNull: false,
    },
    estatus: {
      type: DataTypes.ENUM('Nuevo', 'En Progreso', 'Resuelto', 'Cerrado'),
      defaultValue: 'Nuevo',
      allowNull: false,
    },
    notasInternas: {
      type: DataTypes.TEXT,
      field: 'notas_internas',
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
    assignedTo: {
      type: DataTypes.INTEGER,
      field: 'assigned_to',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    fechaCierre: {
      type: DataTypes.DATE,
      field: 'fecha_cierre',
    },
  }, {
    timestamps: true,
    tableName: 'tickets',
    defaultScope: {
      attributes: { exclude: ['userId', 'assignedTo'] },
      include: [
        { association: 'user', attributes: ['id', 'username', 'email'] },
        { association: 'assignedUser', attributes: ['id', 'username', 'email'] },
      ],
    },
  });

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
    
    Ticket.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignedUser',
    });
    
    Ticket.hasMany(models.ChatMessage, {
      foreignKey: 'ticketId',
      as: 'messages',
      onDelete: 'CASCADE',
    });
  };

  return Ticket;
};
