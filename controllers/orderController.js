const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Place an order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, totalAmount, address, paymentStatus = 'pending' } = req.body;

    // If products not provided, try to use user's cart
    let items = products;
    if (!items || !Array.isArray(items) || items.length === 0) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No products provided or no items in cart'
        });
      }
      // map cart items into order items and include current product price snapshot
      items = await Promise.all(
        cart.products.map(async (p) => {
          const prod = await Product.findById(p.productId);
          return {
            productId: p.productId,
            quantity: p.quantity,
            price: prod ? prod.new_price : 0
          };
        })
      );
    } else {
      // Ensure price is present for each item (snapshot)
      items = await Promise.all(
        items.map(async (p) => {
          if (!p.productId || !p.quantity) throw new Error('Each product must have productId and quantity');
          const prod = await Product.findById(p.productId);
          return {
            productId: p.productId,
            quantity: p.quantity,
            price: prod ? prod.new_price : 0
          };
        })
      );
    }

    // calculate total if not provided
    const calcTotal = items.reduce((sum, it) => sum + (it.price || 0) * Number(it.quantity || 1), 0);
    const finalAmount = totalAmount != null ? Number(totalAmount) : calcTotal;

    const order = new Order({
      user: userId,
      products: items,
      totalAmount: finalAmount,
      address,
      paymentStatus
    });

    await order.save();

    // clear user's cart if it existed
    try {
      await Cart.findOneAndDelete({ user: userId });
    } catch (e) {
      // ignore cart clearing errors
    }

    return res.status(201).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('placeOrder error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get orders for the logged-in user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('products.productId').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('getUserOrders error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', '-password').populate('products.productId').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('getAllOrders error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders
};
