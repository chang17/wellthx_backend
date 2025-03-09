module.exports = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    username: 'VARCHAR(50) NOT NULL UNIQUE',
    email: 'VARCHAR(100) NOT NULL UNIQUE',
    password_hash: 'VARCHAR(255) NOT NULL',
    role: "ENUM('member', 'admin') NOT NULL DEFAULT 'member'",
    referrer_id: 'INT UNSIGNED DEFAULT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};