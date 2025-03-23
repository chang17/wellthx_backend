const http = require("http");
const { wss } = require("./websocket");
const app = require("./app");
const db = require("./config/dbConfig"); // ✅ Ensure correct path
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const referralRoutes = require("./routes/referralRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transferRoutes = require("./routes/transferRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const productRoutes = require("./routes/productRoutes");
const redeemRoutes = require("./routes/redeemRoutes");
const conversionRoutes = require("./routes/conversionRoutes");
//const transactionRoutes = require("./routes/transactionRoutes");
//const bonusRoutes = require("./routes/bonusRoutes");
require("./queues/bonusWorker"); //Ensure the worker runs in the background to process queued bonus requests.

// ✅ Enable CORS BEFORE Routes
app.use(cors({
    origin: "http://localhost:5173",  // ✅ Allow frontend origin
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

const server = http.createServer(app);
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

// ✅ Define Routes AFTER CORS Middleware
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/withdraw",withdrawalRoutes);
app.use("/api/product",productRoutes);
app.use("/api/redeem",redeemRoutes);
app.use("/api/convert",conversionRoutes);

//app.use("/api/bonus", bonusRoutes);
//app.use("/api/transaction", transactionRoutes);


// ✅ Ensure Database Connection
db.getConnection()
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection failed:", err));

const cronService = require('./services/cronService'); // Import cron jobs

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log('✅ Cron jobs initialized.');