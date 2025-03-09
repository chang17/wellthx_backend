module.exports = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    user_id: 'INT UNSIGNED NOT NULL',
    transaction_type: "ENUM('Deposit', 'Withdrawal', 'Bonus', 'Referral', 'Purchase', 'Rebate Conversion') NOT NULL",
    amount: 'DECIMAL(15,2) NOT NULL',
    status: "ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending'",
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};