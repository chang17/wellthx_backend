const transporter = require('../config/emailConfig');

const sendEmail = async (to, subject, text) => {
    console.log("Sending email from:", process.env.EMAIL_USER);
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

module.exports = { sendEmail };