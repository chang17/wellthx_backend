const db = require('../config/dbConfig');
const redeemRepository = require('../repositories/redeemRepository');
const walletRepository = require('../repositories/walletRepository');
const productRepository = require('../repositories/productRepository');
const transactionRepository = require('../repositories/transactionRepository');


class RedeemService {
    async createRedemption(memberId, productId, totalUnits, recipientName, address, postcode, state, country) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // ✅ Get product details WITH ROW LOCK
            const product = await productRepository.getProductByIdForUpdate(productId, connection);
            console.log("Product : " , product);
            //const unit = parseFloat(totalUnits)
            if (!product || product.balance_units < totalUnits) {
                connection.release(); // 🛑 Ensure connection is released before throwing error
                throw new Error("Insufficient product stock.");
            }
            // ✅ Deduct product stock
            const newBalance = product.balance_units - totalUnits;
            console.log("New Balance: " + newBalance);
            // ✅ Deduct product stock
            await productRepository.updateProductUnits(productId, newBalance, connection);

            


            // Check member wallet balance
            const totalAmount = parseFloat(product.selling_price * totalUnits);
            const wallet = await walletRepository.getShoppingWalletsByMemberId(memberId);
            console.log("wallet : " , wallet);
            console.log("walletBalance : " , wallet.balance);
            console.log("totalAmount : " , totalAmount);
            if (parseFloat(wallet.balance) < totalAmount) {
                throw new Error("Insufficient shopping wallet balance.");
            }

            // Debit wallet
            await walletRepository.debitWallet(memberId, 3, totalAmount, connection);

            //Create transaction
            await transactionRepository.createTransaction(memberId, "DEBIT", "Create Redemption", 3, totalAmount, "Debit shopping point from wallet for redemption", connection);
           
            // Create redemption record
            const redeemData = {
                member_id: memberId,
                product_id: productId,
                total_units: totalUnits,
                amount: totalAmount,
                recipient_name: recipientName,
                address,
                state,
                postcode,
                country: country,
                status: 'pending'
            };
            const redeemId = await redeemRepository.createRedeemTransaction(redeemData, connection);

            await connection.commit();
            return { redeemId, status: "Redemption created successfully." };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async cancelRedemption(redeemId, memberId) {
        const redemption = await redeemRepository.getRedemptionById(redeemId);
        if (!redemption || redemption.status !== 'pending') {
            throw new Error("Cannot cancel, redemption already processed.");
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Credit wallet
            await walletRepository.creditWallet(memberId, 3, redemption.amount, connection);

            // Update redemption status
            await redeemRepository.updateRedemptionStatus(redeemId, 'canceled', connection);

            //Create transaction
            await transactionRepository.createTransaction(memberId, "CREDIT", "Cancel Redemption", 3, redemption.amount, "Credit back shopping point to wallet", connection);
                       

            await connection.commit();
            return { status: "Redemption canceled successfully." };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async approveRedemption(redeemId) {
        await redeemRepository.updateRedemptionStatus(redeemId, 'approved');
        return { status: "Redemption approved." };
    }

    async confirmDelivery(redeemId, logisticCompany, trackingNumber, confirmedDate) {
        try {
            const formattedDate = new Date(confirmedDate).toISOString().slice(0, 19).replace("T", " ");
            await redeemRepository.updateLogistics(redeemId, logisticCompany, trackingNumber, formattedDate);
            return { status: "Logistics updated successfully." };
        } catch (error) {
            console.log("confirmDelivery error : " , error);
            throw error;
        }
    }

    async markAsDelivered(redeemId,deliveredDate) {
        const formattedDate = new Date(deliveredDate).toISOString().slice(0, 19).replace("T", " ");
        await redeemRepository.updateDeliverLogistics(redeemId, formattedDate);
        return { status: "Product marked as delivered." };
    }

    async getRedemptionList(status) {
        return await redeemRepository.getRedemptionList(status);
    }

    async getRedemptionByMemberId(memberId) {
        return await redeemRepository.getRedemptionByMemberId(memberId);
    }

    
}



module.exports = new RedeemService();
