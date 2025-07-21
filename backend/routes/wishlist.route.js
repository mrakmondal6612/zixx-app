const express = require("express");
const { WishlistModel } = require("../models/wishlist.model");
const { authenticator } = require("../middlewares/authenticator.middleware");

const WishlistRouter = express.Router();

// Get Wishlist
WishlistRouter.get("/user/wishlist", authenticator, async (req, res) => {
  try {
    const wishlist = await WishlistModel.findOne({ userId: req.userid }).populate("productIds");
    res.json({ wishlist: wishlist?.productIds || [] });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.message });
  }
});

// Add to Wishlist
WishlistRouter.post("/user/wishlist/add", authenticator, async (req, res) => {
  const { productId } = req.body;
  try {
    let wishlist = await WishlistModel.findOne({ userId: req.userid });

    if (!wishlist) {
      wishlist = new WishlistModel({ userId: req.userid, productIds: [productId] });
    } else if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
    }

    await wishlist.save();
    res.json({ msg: "Product added to wishlist" });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.message });
  }
});

// Remove from Wishlist
WishlistRouter.post("/user/wishlist/remove", authenticator, async (req, res) => {
  const { productId } = req.body;
  try {
    const wishlist = await WishlistModel.findOne({ userId: req.userid });
    if (wishlist) {
      wishlist.productIds = wishlist.productIds.filter(p => p.toString() !== productId);
      await wishlist.save();
    }
    res.json({ msg: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.message });
  }
});

module.exports = { WishlistRouter };
