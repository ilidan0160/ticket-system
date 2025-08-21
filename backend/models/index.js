const { Sequelize } = require('sequelize');
const config = require('../config/database');
const User = require('./user');
const Ticket = require('./ticket');
const ChatMessage = require('./chatMessage');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Initialize models
const models = {
  User: User(sequelize, Sequelize),
  Ticket: Ticket(sequelize, Sequelize),
  ChatMessage: ChatMessage(sequelize, Sequelize),
};

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  ...models,
  sequelize,
  Sequelize,
};
