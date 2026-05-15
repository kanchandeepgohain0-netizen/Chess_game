const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ORIGIN: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());

app.use('api/auth', require('./routes/auth'));
app.use('api/user', require('./routes/user'));
app.use('api/rooms', require('./routes/rooms'));

app.get('health', (req,res) =>  {
    res.json({ok : true})
}
);

module.exports = app;