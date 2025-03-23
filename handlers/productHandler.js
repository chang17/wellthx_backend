const productService = require('../services/productService');

// ✅ Get all product information
async function getAllProducts(req, res) {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// ✅ Get product by ID
async function getProductById(req, res) {
    try {
        const { productId } = req.params;
        const product = await productService.getProductById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// ✅ Add new product
async function addProduct(req, res) {
    try {
        const productData = req.body;
        await productService.addProduct(productData);
        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// ✅ Update product information
async function updateProduct(req, res) {
    try {
        const { productId } = req.params;
        const productData = req.body;
        await productService.updateProduct(productId, productData);
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// ✅ Update product status (Active/Inactive)
async function updateProductStatus(req, res) {
    try {
        const { productId } = req.params;
        const { status } = req.body;
        await productService.updateProductStatus(productId, status);
        res.json({ message: "Product status updated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStatus
};
