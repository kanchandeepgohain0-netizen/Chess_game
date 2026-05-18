const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));

app.get('/health', (req,res) =>  {
    res.json({ok : true})
}
);

module.exports = app;