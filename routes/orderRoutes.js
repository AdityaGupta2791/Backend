const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { placeOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/user', protect, getUserOrders);
router.get('/', protect, adminOnly, getAllOrders);

module.exports = router;
