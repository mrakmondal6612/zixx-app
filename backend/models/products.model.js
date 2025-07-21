// models/products.model.js
const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  rating: { type: String },
  theme: { type: String, required: true },
  size: { type: [String], required: true },
  color: { type: [String], required: true },
  image: { type: [String], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }  // 👈 Add this line
});

const ProductModel = mongoose.model("product", productSchema);
module.exports = { ProductModel };
