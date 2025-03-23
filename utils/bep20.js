const { Wallet } = require("ethers");

/**
 * Generate a new BEP20 wallet (BSC-compatible) using ethers.js.
 * Returns an object with publicAddress and privateKey.
 */
function createBep20Address() {
  const wallet = Wallet.createRandom();
  return {
    publicAddress: wallet.address,       // 42-character address (e.g., "0x...")
    privateAddress: wallet.privateKey      // Private key (66 characters with 0x prefix)
  };
}

module.exports = { createBep20Address };
