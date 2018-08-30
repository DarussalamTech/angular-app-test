// get configs from environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET || 'supersecretalltheway';
const ROOT = process.env.ROOT || '';

//Db connection credentional
const Username = 'root';
const Password = process.env.Password || '';
const Database = process.env.Database || 'chat';
const Host =  process.env.Host || 'localhost';
const Dialect =  process.env.Dialect || 'mysql';

// init config obj containing the app settings
const config = {
  env: NODE_ENV,
  root: ROOT,
  server: {
    port: PORT
  },
  username: Username,
  password: Password,
  database: Database,
  host: Host,
  dialect: Dialect,
  operatorsAliases: false,
  secret: SECRET
};


module.exports = config;
