const Sequelize = require('sequelize');
const UserModel = require('./models/user');
const ConversationModel = require('./models/conversation');
const MessagesModel = require('./models/message');
const config = require('./config/index');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const User = UserModel(sequelize, Sequelize);
const Conversation = ConversationModel(sequelize, Sequelize);
const Messages = MessagesModel(sequelize, Sequelize);
module.exports = {User, Conversation, Messages};
