async function withdrawFromCustomer() {
    const nonce = await web3.eth.getTransactionCount(customerAccount.address, "pending");

    const withdrawalAmount = web3.utils.toWei("10", "mwei"); // 10 USDT

    const tx = {
        from: customerAccount.address,
        to: process.env.USDT_CONTRACT_ADDRESS,
        data: usdtContract.methods.transfer(process.env.COMPANY_PUBLIC_ADDRESS, withdrawalAmount).encodeABI(),
        gas: 200000,
        gasPrice: await web3.eth.getGasPrice(),
        nonce
    };

    const signedTx = await customerAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("Withdrawal Transaction Hash:", receipt.transactionHash);
}

withdrawFromCustomer();
