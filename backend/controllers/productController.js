const Product = require("../models/Product");

async function getMyProducts(req, res, next) {
  try {
    const products = await Product.find({ exhibitor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, kind, category, price, description } = req.body;
    if (!name || !category || !description) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    const product = await Product.create({
      exhibitor: req.user._id,
      name, kind, category, price, description,
    });
    res.status(201).json({ success: true, message: "Item added.", product });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, exhibitor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, message: "Product updated.", product });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, exhibitor: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, message: "Product removed." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct };