require('dotenv').config();
const app     = require('./app');
const http    = require('http');
const connectDB   = require('./config/db');
const { initSocket } = require('./sockets');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;


connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
  );
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
