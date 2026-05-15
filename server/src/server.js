require('dotenv').config();
const app  = require('./src/app');
const http = require('http');
const {initSocket} = require('./src/socket');

const server  = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => 
    console.log('Server is running on port' + PORT)
);

