const express = require("express");
const { ProductModel } = require("../models/products.model");
const BrandRouter = express.Router();

// Get all unique brands
BrandRouter.get("/brands", async (req, res) => {
  try {
    // Get all unique brands from products
    const brands = await ProductModel.aggregate([
      { $group: { _id: "$brand", logo: { $first: "$image" } } },
      { $project: { name: "$_id", logo: { $arrayElemAt: ["$logo", 0] }, _id: 0 } },
      { $sort: { name: 1 } }
    ]);
    res.json({ data: brands, ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error fetching brands", error: error.message });
  }
});

module.exports = { BrandRouter };
