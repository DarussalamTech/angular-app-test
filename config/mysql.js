const Sequelize = require('sequelize');
const config = require('./index');
//const log = require('../log');


// to export: init mysql connection, set logging
const init = () => {
    mySqlConnect();
};

// connect to mysql host
const mySqlConnect = () => {
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
    }).catch((err) => {
        console.log('Unable to connect to the database:', err);
    });
};


module.exports = init;
