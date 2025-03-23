const productRepository = require('../repositories/productRepository');

// ✅ Get all product information
async function getAllProducts() {
    return await productRepository.getAllProducts();
}

// ✅ Get product by ID
async function getProductById(productId) {
    return await productRepository.getProductById(productId);
}

// ✅ Add new product
async function addProduct(productData) {
    console.log("name : " + productData.name);
    console.log("selling_price : " + productData.selling_price);
    console.log("balance_units : " + productData.balance_units);
    if (!productData.name || !productData.selling_price || productData.balance_units === undefined) {
        throw new Error("Missing required product details");
    }
    await productRepository.addProduct(productData);
}

// ✅ Update product information
async function updateProduct(productId, productData) {
    await productRepository.updateProduct(productId, productData);
}

// ✅ Update product status
async function updateProductStatus(productId, status) {
    if (status !== "active" && status !== "inactive") {
        throw new Error("Invalid status value");
    }
    await productRepository.updateProductStatus(productId, status);
}

// ✅ Deduct product unit during redemption
async function deductProductUnit(productId, units) {
    const product = await productRepository.getProductById(productId);
    if (!product) throw new Error("Product not found");
    if (product.balance_unit < units) throw new Error("Insufficient product units");

    await productRepository.updateProductUnit(productId, product.balance_unit - units);
}

// ✅ Add back product unit when redemption is canceled
async function addBackProductUnit(productId, units) {
    const product = await productRepository.getProductById(productId);
    if (!product) throw new Error("Product not found");

    await productRepository.updateProductUnit(productId, product.balance_unit + units);
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStatus,
    deductProductUnit,
    addBackProductUnit
};
