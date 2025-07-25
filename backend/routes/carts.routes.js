
const express = require("express");
const CartRouter = express.Router();
require("dotenv").config();

const { CartModel } = require("../models/cart.model");
const { authenticator } = require("../middlewares/authenticator.middleware");

// Get single cart product by cart item id
CartRouter.get('/user/getcart/:id', authenticator, async (req, res) => {
  try {
    const userId = req.userid;
    const cartId = req.params.id;
    const cartItem = await CartModel.findOne({ _id: cartId, userId });
    if (!cartItem) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    res.json({ data: cartItem });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch cart item', error: err.message });
  }
});

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
    const product = await CartModel.findOne({ productId, userId, "variation": { size: payload.variation.size, color: payload.variation.color }  }); 
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
