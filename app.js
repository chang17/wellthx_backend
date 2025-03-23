const express = require('express');
const app = express();
// ✅ Middleware to parse JSON requests
app.use(express.json());
// Example route
app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});

module.exports = app;
