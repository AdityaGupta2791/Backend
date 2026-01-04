const express = require('express');

const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
