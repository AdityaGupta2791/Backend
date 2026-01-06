const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;
  try {
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(__dirname, '..', 'upload', 'images', filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Image delete skipped:", filename);
      } else {
        console.log("Image deleted:", filename);
      }
    });

  } catch (e) {
    console.log("Error deleting image:", e.message);
  }
};

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: 0,
      message: "No file uploaded"
    });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

  return res.status(200).json({
    success: 1,
    image_url: imageUrl
  });
};


const addProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price
    });

    await product.save();
    return res.status(201).json({
      success: true,
      product
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    return res.status(200).json({
      success: true,
      products
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const { name, image, category, new_price, old_price } = req.body;

    // If a new image is provided → delete old one
    if (image && image !== product.image) {
      deleteImageFile(product.image);
      product.image = image;
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (new_price) product.new_price = new_price;
    if (old_price) product.old_price = old_price;

    await product.save();
    return res.status(200).json({
      success: true,
      message: "Product updated"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

const removeProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    deleteImageFile(product.image);
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted"
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
  uploadImage,
  addProduct,
  getAllProducts,
  updateProduct,
  removeProduct,
};
