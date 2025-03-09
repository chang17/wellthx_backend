const express = require('express');
const app = express();

// Example route
app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});

module.exports = app;
