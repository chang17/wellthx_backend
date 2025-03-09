module.exports = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    user_id: 'INT UNSIGNED DEFAULT NULL',
    message: 'TEXT NOT NULL',
    status: "ENUM('unread', 'read') DEFAULT 'unread'",
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};