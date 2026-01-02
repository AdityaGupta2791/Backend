const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Add item to cart (create cart if not exists)
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // 1. productId must be provided
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required"
      });
    }

    // 2. ensure product still exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 3. fetch or create user cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // 4a. no cart exists yet -> create with the product
      cart = new Cart({ user: userId, products: [{ productId, quantity }] });
    } else {
      // 4b. cart exists -> update quantity if product present, otherwise add
      const existing = cart.products.find((p) => p.productId.equals(productId));
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    // 5. save cart and return
    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Update quantity for a specific product in cart (if quantity <= 0 => remove)
const updateQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. quantity must be provided
    if (quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }

    // 2. quantity must be >= 1
    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    // 3. ensure product still exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 4. fetch user cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // 5. locate product inside cart
    const item = cart.products.find(p => p.productId.equals(productId));
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // 6. update quantity
    item.quantity = Number(quantity);

    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};


// Remove an item from cart
const removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // 1. fetch user cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // 2. remove the item from the cart
    const before = cart.products.length;
    cart.products = cart.products.filter((p) => !p.productId.equals(productId));

    // 3. if no item was removed, return 404
    if (cart.products.length === before) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // 4. save and return updated cart
    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Get the user's cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. fetch cart for user and populate product details
    const cart = await Cart.findOne({ user: userId }).populate('products.productId');

    // 2. if no cart exists, return an empty cart object
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { user: userId, products: [] }
      });
    }

    // 3. return the found cart
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

module.exports = { 
  addToCart, 
  updateQuantity, 
  removeItem, 
  getUserCart 
};
