const mongoose = require("mongoose");
const { ProductModel } = require("../models/products.model");
const { ProductStat } = require("../models/ProductStat.model");

// ✅ Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await ProductModel.find().populate("userId", "first_name last_name email role");
//     res.json({ data: products, ok: true });
//   } catch (error) {
//     res.status(500).send({ msg: "Error fetching all products", error: error.message });
//   }
// }

exports.getProducts = async (req, res) => {
  try {
    // 1️⃣ Fetch all products from main server DB
    const products = await ProductModel.find().lean(); // lean() gives plain JS objects

    // 2️⃣ Attach stats for each product
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({ productId: product._id }).lean();
        return { ...product, stat };
      })
    );

    // 3️⃣ Map products to UI-friendly shape
    const mapped = productsWithStats.map((p) => ({
      _id: p._id,
      name: p.title || p.name || '',
      description: p.description || '',
      image: p.image || [],
      price: p.price || 0,
      rating: p.rating || 0,
      color: Array.isArray(p.color) ? p.color.join(", ") : '',
      size: Array.isArray(p.size) ? p.size.join(", ") : '',
      category: p.category || '',
      subcategory: p.subcategory || '',
      supply: p.supply || p.stock || 0,
      brand: p.brand || '',
      stat: p.stat || [],
    }));

    res.status(200).json({data:mapped, ok: true});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get product by name 
exports.getProductByName = async (req, res) => {
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
};

// ✅ Get products by uploader user ID (admin only)
exports.getProductsByUserId = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }

    const products = await ProductModel.find({ userId: req.params.userid }).populate("userId", "first_name last_name email");
    res.send({ data: products, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching products for user", error: error.message });
  }
}

// ✅ Get single product by ID
exports.getSingleProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.send({ data: product, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching product", error: error.message });
  }
}

// ✅ Get categories By Gender
exports.getCategoriesByGender = async (req, res) => {
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
}

// ✅ Add product
exports.addProduct = async (req, res) => {
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
}

// ✅ Get products by gender men
exports.getProductsByGenderMen = async (req, res) => {
  
  try {
    const products = await ProductModel.find({ gender: { $regex: /^men$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
}

// ✅ Get products by gender women
exports.getProductsByGenderWomen = async (req, res) => {
  try {
    const products = await ProductModel.find({ gender: { $regex: /^women$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
}

// ✅ Get products by gender kids
exports.getProductsByGenderKids = async (req, res) => {
  try {
    const products = await ProductModel.find({ gender: { $regex: /^kid$/i } });
    res.send({ data: products, count: products.length, ok: true });
  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message });
  }
}

// ✅ Get products by subcategory
exports.getProductsBySubcategory = async (req, res) => {
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
}

// Update product
exports.updateProduct = async (req, res) => {
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
}

// Delete product
exports.deleteProduct = async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Access denied" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ ok: false, msg: "Product ID is required" });
  }
  try{
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ ok: false, msg: "Invalid Product ID" });
    }
  } catch (error) {
      return res.status(400).send({ ok: false, msg: "Invalid Product ID format" });
    }
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).send({ ok: false, msg: "Product not found" });
    }
  } catch (error) {
    return res.status(500).send({ ok: false, msg: "Error fetching product", error: error.message });
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
}

