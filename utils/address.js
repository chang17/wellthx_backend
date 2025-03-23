const { Web3 } = require("web3"); // Destructure Web3 from the module

const web3 = new Web3("https://bsc-testnet.publicnode.com"); // BSC Testnet
const account = web3.eth.accounts.create();

console.log("Public Address:", account.address);
console.log("Private Key:", account.privateKey);
