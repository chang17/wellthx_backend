/*
const app = require('./api');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
*/

const http = require('http');
const { wss } = require('./websocket');
const app = require('./app');
const db = require('./config/dbConfig'); // ✅ Ensure the correct path

const adminRoutes = require('./routes/adminRoutes');
//const bonusRoutes = require('./routes/bonusRoutes');
const memberRoutes = require('./routes/memberRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const referralRoutes = require('./routes/referralRoutes');
//const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
console.log("adminRoutes type:", typeof adminRoutes); // This should print "function" (not "object")
//console.log("bonusRoutes type:", typeof bonusRoutes); // This should print "function" (not "object")
console.log("memberRoutes type:", typeof memberRoutes); // This should print "function" (not "object")
console.log("notificationRoutes type:", typeof notificationRoutes); // This should print "function" (not "object")
console.log("referralRoutes type:", typeof referralRoutes); // This should print "function" (not "object")
//console.log("transactionRoutes type:", typeof transactionRoutes); // This should print "function" (not "object")
console.log("userRoutes type:", typeof userRoutes); // This should print "function" (not "object")
console.log("walletRoutes type:", typeof walletRoutes); // This should print "function" (not "object")

const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Routes
app.use('/api/admin', adminRoutes);
//app.use('/api/bonus', bonusRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/referral', referralRoutes);
//app.use('/api/transaction', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

db.getConnection()
.then(() => console.log('Database connected successfully'))
.catch((err) => console.error('Database connection failed:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
