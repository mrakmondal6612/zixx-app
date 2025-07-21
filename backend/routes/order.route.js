const express = require("express");
const { OrderModel } = require("../models/order.model");
const { CartModel } = require("../models/cart.model");
const { authenticator } = require("../middlewares/authenticator.middleware");

const OrderRouter = express.Router();

OrderRouter.post("/order/buy", authenticator, async (req, res) => {
  try {
    console.log("User ID:", req.userid);
    console.log("Request Body:", req.body);
    const cartItems = await CartModel.find({ userid: req.userid });
    if (!cartItems.length) return res.status(400).json({ msg: "Cart is empty" });

    const productIds = cartItems.map((item) => item.product_id);

    const order = new OrderModel({
      userId: req.userid,
      products: productIds,
    });
    await order.save();

    await CartModel.deleteMany({ userid: req.userid });

    res.json({ msg: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error placing order", error: err.message });
  }
});

module.exports = { OrderRouter };