//require("dotenv").config();
const { Web3 } = require("web3"); // Destructure Web3 from the module

// BSC RPC Provider (Mainnet or Testnet)
const BSC_RPC_URL = process.env.BSC_RPC_URL;
const web3 = new Web3(BSC_RPC_URL); // BSC Testnet


// USDT Contract Address (BEP20 on BSC)
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const USDT_ABI = require("./usdtABI.json"); // Load ERC-20 ABI

const usdtContract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);

module.exports = { web3, usdtContract };
