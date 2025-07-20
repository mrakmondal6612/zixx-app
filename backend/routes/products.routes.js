const express = require("express");
const { ProductModel } = require("../models/products.model");
const { authenticator } = require("../middlewares/authenticator.middleware");
const ProductRouter = express.Router();
ProductRouter.use(express.json());

ProductRouter.get("/products", async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.json({ data: products, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching all products", error: error.message });
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

    const payload = {
      ...req.body,
      userId: user.userid
    };

    const newProduct = new ProductModel(payload);
    await newProduct.save();
    res.send({ msg: "Product Added Successfully", ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error adding product", error: error.message });
  }
});

// other routes...
ProductRouter.get("/products/men/:subcategory", async (req, res) => {
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

ProductRouter.patch("/products/update/:id", async (req, res) => {
  try {
    await ProductModel.findByIdAndUpdate(req.params.id, req.body);
    res.send({ msg: "Product updated" });
  } catch (error) {
    res.status(500).send({ msg: "Server error", error: error.message });
  }
});

ProductRouter.delete("/products/delete/:id", async (req, res) => {
  try {
    await ProductModel.findByIdAndDelete(req.params.id);
    res.send({ msg: "Product deleted" });
  } catch (error) {
    res.status(500).send({ msg: "Server error", error: error.message });
  }
});

module.exports = { ProductRouter };
