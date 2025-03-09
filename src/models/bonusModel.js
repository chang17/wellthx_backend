module.exports = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    user_id: 'INT UNSIGNED NOT NULL',
    bonus_type: "ENUM('referral', 'level', 'rebate', 'reward_cap', 'repurchase') NOT NULL",
    amount: 'DECIMAL(10,2) NOT NULL',
    status: "ENUM('pending', 'approved', 'paid') DEFAULT 'pending'",
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};
