const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const initData = require("./data.js");
const { ProductModel } = require("../models/products.model.js");

const init = async () => {
  try {
    mongoose.set("strictQuery", true);

    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("❌ MONGO_URL not found in environment variables.");
    // console.log("📦 MONGO_URL:", uri); // Debugging

    await mongoose.connect(uri);

    await ProductModel.deleteMany();
    await ProductModel.insertMany(initData);

    console.log("✅ Data Inserted");
    process.exit();
  } catch (error) {
    console.log("❌ Error in inserting data");
    console.log(error.message);
    process.exit(1);
  }
};

init();
