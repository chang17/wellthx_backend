const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER, // Your Yahoo email
      pass: process.env.EMAIL_PASSWORD, // Yahoo App Password
    },
  });

module.exports = transporter;