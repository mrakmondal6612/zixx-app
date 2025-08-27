const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const initData = require("./data.js");
const { ProductModel } = require("../models/products.model.js");
const ADMIN_ID = "";
const init = async () => {
  try {
    mongoose.set("strictQuery", true);

    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("❌ MONGO_URL not found in environment variables.");
    // console.log("📦 MONGO_URL:", uri); // Debugging

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Delete existing data
    await ProductModel.deleteMany({});
    console.log("✅ Existing data deleted");

    const newData = initData.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: ADMIN_ID, // Assigning the admin user ID to all products
      _id: item._id || new mongoose.Types.ObjectId() // Ensure each product has a unique ID
    }));

    await ProductModel.insertMany(newData);

    console.log("✅ Data Inserted");
    // console.log("📦 Data:", newData); // Debugging

    process.exit();
  } catch (error) {
    console.log("❌ Error in inserting data");
    console.log(error.message);
    process.exit(1);
  }
};

init();
