const { Web3 } = require("web3"); // Destructure Web3 from the module
const web3 = new Web3(process.env.BSC_RPC_URL);

const USDT_ABI = require("../config/usdtABI.json");
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS; // Testnet USDT
const COMPANY_PRIVATE_KEY = process.env.COMPANY_PRIVATE_KEY;
const COMPANY_WALLET_ADDRESS = process.env.COMPANY_PUBLIC_ADDRESS;

const usdtContract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
web3.eth.accounts.wallet.add(COMPANY_PRIVATE_KEY);

const blockchainService = {
    async sendUSDT(toAddress, amount) {
        const weiAmount = web3.utils.toWei(amount.toString(), "ether");

        const tx = usdtContract.methods.transfer(toAddress, weiAmount);
        const gas = await tx.estimateGas({ from: COMPANY_WALLET_ADDRESS });
        const gasPrice = await web3.eth.getGasPrice();

        const txData = {
            from: COMPANY_WALLET_ADDRESS,
            to: USDT_CONTRACT_ADDRESS,
            data: tx.encodeABI(),
            gas,
            gasPrice,
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, COMPANY_PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return receipt.transactionHash;
    },
};

module.exports = blockchainService;

