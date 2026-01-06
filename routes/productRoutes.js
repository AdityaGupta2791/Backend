const express = require('express');
const router = express.Router();
const { uploadImage, addProduct, updateProduct, removeProduct, getAllProducts } = require('../controllers/productController');
const { upload } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/upload', protect, adminOnly, upload.single('product'), uploadImage);
router.post('/addproduct', protect, adminOnly, addProduct);
router.put('/product/:id', protect, adminOnly, updateProduct);
router.delete('/product/:id', protect, adminOnly, removeProduct);
router.get('/', getAllProducts);

module.exports = router;
