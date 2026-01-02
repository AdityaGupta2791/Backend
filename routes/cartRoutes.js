const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addToCart, updateQuantity, removeItem, getUserCart } = require('../controllers/cartController');

router.post('/add', protect, addToCart);
router.put('/item/:productId', protect, updateQuantity);
router.delete('/item/:productId', protect, removeItem);
router.get('/', protect, getUserCart);

module.exports = router;
