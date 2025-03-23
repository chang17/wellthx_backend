const db = require('../config/dbConfig');

// ✅ Get all product information
async function getAllProducts() {
    const [rows] = await db.execute(`SELECT * FROM products`);
    return rows;
}

// ✅ Get product by ID
async function getProductById(productId) {
    const [rows] = await db.execute(`SELECT * FROM products WHERE id = ?`, [productId]);
    return rows.length ? rows[0] : null;
}

// ✅ Add new product
async function addProduct(productData) {
    console.log('addProduct', productData);
    try{
        await db.execute(
            `INSERT INTO products (name, selling_price, balance_units, total_units, status, description) VALUES (?, ?, ?, ?, ?, ?)`,
            [productData.name, productData.selling_price, productData.balance_units, productData.balance_units, "active", productData.description]
        );
    } catch (e) {
        console.log('Error adding product', e);
        throw e;
    }
}

// ✅ Update product information
async function updateProduct(productId, productData) {
    try{
        await db.execute(
            `UPDATE products SET name = ?, selling_price = ?, balance_units = ? WHERE id = ?`,
            [productData.name, productData.selling_price, productData.balance_units, productId]
        );
    } catch (e) {
        console.log('Error adding product', e);
        throw e;
    }
}

// ✅ Update product status
async function updateProductStatus(productId, status) {
    await db.execute(`UPDATE products SET status = ? WHERE id = ?`, [status, productId]);
}

// ✅ Update product unit (for redeem & cancel)
async function updateProductUnit(productId, newUnit) {
    await connection.execute(`UPDATE products SET balance_unit = ? WHERE id = ?`, [newUnit, productId]);
}
async function getProductByIdForUpdate(productId, connection) {
    const [rows] = await connection.execute(
        `SELECT * FROM products WHERE id = ? FOR UPDATE`, 
        [productId]
    );
    return rows[0];
}
async function updateProductUnits(productId, newUnit, connection) {
    try{
        await connection.execute(
            `UPDATE products SET balance_units = ? WHERE id = ?`,
            [newUnit, productId]
        );
    } catch(error) {
        console.log('Error updating product units', error);
        throw error;
    }
    
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStatus,
    updateProductUnit,
    updateProductUnits,
    getProductByIdForUpdate
};
