require("dotenv").config();
const { Web3 } = require("web3"); // Destructure Web3 from the module

// Initialize Web3 directly with the RPC URL
const web3 = new Web3(process.env.BSC_TESTNET_RPC);

console.log("Web3 connected:", web3 ? true : false);

const usdtContract = new web3.eth.Contract([
    // Standard BEP20 Transfer function ABI
    {
        "constant": false,
        "inputs": [
            { "name": "recipient", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
], process.env.USDT_CONTRACT_ADDRESS);

// Generate a new customer wallet
const customerAccount = web3.eth.accounts.create();
console.log("New Customer Address:", customerAccount.address);
console.log("CustomerAccount : ", customerAccount)

// Fund this wallet with USDT from the company
async function depositToCustomer() {
    const companyAccount = web3.eth.accounts.privateKeyToAccount(process.env.COMPANY_PRIVATE_KEY);
    const nonce = await web3.eth.getTransactionCount(companyAccount.address, "pending");

    const depositAmount = web3.utils.toWei("10", "mwei"); // 10 USDT (6 decimals)

    const tx = {
        from: companyAccount.address,
        to: process.env.USDT_CONTRACT_ADDRESS,
        data: usdtContract.methods.transfer(customerAccount.address, depositAmount).encodeABI(),
        gas: 200000,
        gasPrice: await web3.eth.getGasPrice(),
        nonce
    };

    const signedTx = await companyAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("Deposit Transaction Hash:", receipt.transactionHash);
}

depositToCustomer();
