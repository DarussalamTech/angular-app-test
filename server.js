const http = require('http');
const app = require('./app');
const config = require('./config/index');
const connectMySql = require('./config/mysql');
const log = require('./log');
const io = require('./chat/io');

// init server instance
const server = http.createServer(app);

// connect to services
connectMySql();
io(server);

// start server
server.listen(config.server.port, (err) => {
  if (err) {
    log.err('server', 'could not start listening', err.message || err);
    process.exit();
  }
  log.log('env', `app starting in "${config.env}" mode...`);
  log.log('server', `Express server is listening on ${config.server.port}...`);
});
