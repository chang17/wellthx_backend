const express = require('express');
const router = express.Router();
const productHandler = require('../handlers/productHandler');

// ✅ Get all product information
router.get('/', productHandler.getAllProducts);

// ✅ Get product by ID
router.get('/:productId', productHandler.getProductById);

// ✅ Add new product
router.post('/', productHandler.addProduct);

// ✅ Update product information
router.put('/:productId', productHandler.updateProduct);

// ✅ Update product status (Active/Inactive)
router.put('/:productId/status', productHandler.updateProductStatus);

module.exports = router;
