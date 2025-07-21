const express = require("express");
const CartRouter = express.Router();
require("dotenv").config();

const { CartModel } = require("../models/cart.model");
const { authenticator } = require("../middlewares/authenticator.middleware");

CartRouter.get("/user/getcart", authenticator, async (req, res) => {
  const token = req.headers.authorization;
  try {
    const product = await CartModel.find({ userid: req.userid });
    return res.json({ data: product });
  } catch (error) {
    res.json({ msg: "Error", Error: error.message });
  }
});

CartRouter.post("/user/addtocart", authenticator, async (req, res) => {
  let payload = req.body;
  console.log("Payload:", payload);
  const productId = req.body.productId;
  const userId = req.userid;

  try {
    const product = await CartModel.findOne({ productId, userId });
    if (product) {
      return res.json({ msg: "Product already in cart" });
    }

    payload.userId = userId;
    const newproduct = new CartModel(payload);
    await newproduct.save();
    return res.json({ msg: "Product added to cart successfully", data: newproduct });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.message });
  }
});


CartRouter.delete("/user/remove/:id", authenticator, async (req, res) => {
  try {
    const id = req.params.id;
    await CartModel.findByIdAndDelete({ _id: id });
    return res.json({ msg: "Product Removed" });
  } catch (error) {
    res.json({ msg: "Error", Error: error.message });
  }
});

module.exports = { CartRouter };
