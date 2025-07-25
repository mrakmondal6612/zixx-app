const express = require("express");
const { ProductModel } = require("../models/products.model");
const mongoose = require("mongoose");
const { authenticator } = require("../middlewares/authenticator.middleware");
const { ReviewRouter } = require("./reviews.routes");
const cloudinary = require('cloudinary').v2;
const ProductRouter = express.Router();


ProductRouter.use(express.json());

// Get product by name (for /product?name=...)
ProductRouter.get("/products/byname/:name", async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name).trim();
    // Log the incoming name for debugging
    console.log("[GET /products/byname/:name] Searching for:", name);
    // Case-insensitive, trimmed exact match
    let product = await ProductModel.findOne({ title: { $regex: `^${name}$`, $options: "i" } });
    if (product) {
      return res.json({ data: product, ok: true });
    }
    // Fallback: partial match (contains)
    console.log("[GET /products/byname/:name] Exact match not found, trying partial match:", name);
    const products = await ProductModel.find({ title: { $regex: name, $options: "i" } });
    if (!products || products.length === 0) {
      console.log("[GET /products/byname/:name] Not found (even partial):", name);
      return res.status(404).json({ ok: false, message: "Product not found" });
    }
    // If only one product found, return as single object for backward compatibility
    if (products.length === 1) {
      return res.json({ data: products[0], ok: true });
    }
    // If multiple products found, return as array
    return res.json({ data: products, ok: true, multiple: true });
  } catch (error) {
    console.error("[GET /products/byname/:name] Error:", error);
    res.status(500).json({ ok: false, message: "Error fetching product by name", error: error.message });
  }
});

// ✅ Get all products (with uploader info)
ProductRouter.get("/products", async (req, res) => {
  try {
    const products = await ProductModel.find().populate("userId", "first_name last_name email role");
    res.json({ data: products, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching all products", error: error.message });
  }
})

// ✅ Get products by uploader user ID (admin only)
ProductRouter.get("/products/user/:userid", authenticator, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }

    const products = await ProductModel.find({ userId: req.params.userid }).populate("userId", "first_name last_name email");
    res.send({ data: products, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching products for user", error: error.message });
  }
});

ProductRouter.get("/products/singleproduct/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.send({ data: product, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching product", error: error.message });
  }
});

ProductRouter.get("/products/categories/:gender", async (req, res) => {
  const gender = req.params.gender.toLowerCase();
  try {
    const query = gender === "all" ? {} : { gender: { $regex: new RegExp(`^${gender}$`, "i") } };
    const products = await ProductModel.find(query);

    const categoriesMap = {};

    products.forEach(product => {
      const { category, subcategory, image } = product;
      if (!categoriesMap[category]) {
        categoriesMap[category] = {
          name: category,
          image: image[0],
          subcategories: new Set()
        };
      }
      categoriesMap[category].subcategories.add(subcategory);
    });

    const formatted = Object.values(categoriesMap).map(cat => ({
      name: cat.name,
      image: cat.image,
      subcategories: Array.from(cat.subcategories)
    }));

    res.send({ data: formatted, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching categories", error: error.message });
  }
});

ProductRouter.post("/products/add", authenticator, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }
    if (!req.body.title || !req.body.description || !req.body.price || !req.body.images) {
      return res.status(400).send({ msg: "All fields are required" });
    }
    if (!req.body.category || !req.body.subcategory || !req.body.gender) {
      return res.status(400).send({ msg: "Category, subcategory, and gender are required" });
    }
    if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
      return res.status(400).send({ msg: "At least one image is required" });
    }
    if (!req.body.size || !Array.isArray(req.body.size) || req.body.size.length === 0) {
      return res.status(400).send({ msg: "At least one size is required", ok: false, data: req.body.size });
    }
    if (!req.body.colors || !Array.isArray(req.body.colors) || req.body.colors.length === 0) {
      return res.status(400).send({ msg: "At least one color is required", ok: false, data: req.body.colors });
    }
    const payload = {
      ...req.body,
      image: req.body.images, // store as 'image' in DB
      userId: user.userid
    };
    delete payload.images;
    const newProduct = new ProductModel(payload);
    await newProduct.save();
    res.send({ msg: "Product Added Successfully", ok: true, data: newProduct });
  } catch (error) {
    res.status(500).send({ msg: "Error adding product", error: error.message });
  }
});


ProductRouter.get("/products/men", async (req, res) => {
  
  try {
    const products = await ProductModel.find({ gender: { $regex: /^men$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
});

ProductRouter.get("/products/women", async (req, res) => {
  try {
    const products = await ProductModel.find({ gender: { $regex: /^women$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
});

ProductRouter.get("/products/kids", async (req, res) => {
  try {
    const products = await ProductModel.find({ gender: { $regex: /^kid$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
});

// other routes...
ProductRouter.get("/products/men/:subcategory", async (req, res) => {
  if (!req.params.subcategory) {
    return res.status(400).send({ msg: "Subcategory is required" });
  }
  try {
    const products = await ProductModel.find({
      gender: { $regex: /^men$/i },
      subcategory: req.params.subcategory
    });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching subcategory", error: error.message });
  }
});

ProductRouter.patch("/products/update/:id", authenticator, async (req, res) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Access denied" });
  }
  if (!req.params.id) {
    return res.status(400).send({ msg: "Product ID is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ msg: "Invalid Product ID" });
  }

  try {
    // If images is sent, update image field for consistency
    let updateData = { ...req.body };
    if (Array.isArray(req.body.images)) {
      updateData.image = req.body.images;
      delete updateData.images;
    }
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).send({ ok: false, msg: "Product not found" });
    }
    res.send({ msg: "Product updated", ok: true, data: updated });
  } catch (error) {
    console.error("[PATCH /products/update/:id] Error:", error);
    res.status(500).send({ ok: false, msg: "Server error", error: error.message });
  }
});

ProductRouter.delete("/products/delete/:id", authenticator, async (req, res) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Access denied" });
  }
  if (!req.params.id) {
    return res.status(400).send({ msg: "Product ID is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ msg: "Invalid Product ID" });
  }
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ msg: "Product not found" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Error fetching product", error: error.message });
  }

  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send({ ok: false, msg: "Product not found" });
    }
    res.send({ msg: "Product deleted", ok: true, data: deleted });
  } catch (error) {
    console.error("[DELETE /products/delete/:id] Error:", error);
    res.status(500).send({ ok: false, msg: "Server error", error: error.message });
  }
});

ProductRouter.use("/reviews", ReviewRouter);

module.exports = { ProductRouter };
