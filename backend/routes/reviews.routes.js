const express = require("express");
const { ReviewModel } = require("../models/reviews.model");
const { ProductModel } = require("../models/products.model");
const { authenticator } = require("../middlewares/authenticator.middleware");

const ReviewRouter = express.Router();

// POST a review, update product rating & count
ReviewRouter.post("/reviews/product/:productId", authenticator, async (req, res) => {
  const { productId } = req.params;
  const userId = req.userid;
  const { rating, comment } = req.body;

  try {
    const existing = await ReviewModel.findOne({ productId, userId });
    if (existing) return res.status(400).json({ msg: "You have already reviewed this product" });

    await ReviewModel.create({ productId, userId, rating, comment });

    const all = await ReviewModel.find({ productId });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    await ProductModel.findByIdAndUpdate(productId, { rating: avg, reviewCount: all.length });

    res.json({ msg: "Review added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET all reviews for product
ReviewRouter.get("/reviews/product/:productId", async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .populate("userId", "first_name last_name profile_pic");
    res.json({ data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// UPDATE a review
ReviewRouter.put("/reviews/:reviewId", authenticator, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.userid;
  const { rating, comment } = req.body;

  try {
    const review = await ReviewModel.findOne({ _id: reviewId, userId });
    if (!review) return res.status(404).json({ msg: "Review not found or not yours" });

    review.rating = rating;
    review.comment = comment;
    review.updatedAt = new Date();
    await review.save();

    // Update product's average rating and review count
    const all = await ReviewModel.find({ productId: review.productId });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    await ProductModel.findByIdAndUpdate(review.productId, { rating: avg, reviewCount: all.length });

    res.json({ msg: "Review updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE a review
ReviewRouter.delete("/reviews/:reviewId", authenticator, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.userid;

  try {
    const review = await ReviewModel.findOneAndDelete({ _id: reviewId, userId });
    if (!review) return res.status(404).json({ msg: "Review not found or not yours" });

    // Update product's average rating and review count
    const all = await ReviewModel.find({ productId: review.productId });
    let avg = 0;
    if (all.length > 0) {
      avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    }
    await ProductModel.findByIdAndUpdate(review.productId, { rating: avg, reviewCount: all.length });

    res.json({ msg: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = { ReviewRouter };
