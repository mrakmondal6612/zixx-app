const { CartModel } = require("../models/cart.model");
const { OrderModel } = require("../models/order.model");


// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userid;
    const orders = await OrderModel.find({ userId });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch orders", error: err.message });
  }
}

// Buy cart products
exports.buyCartProducts = async (req, res) => {
  try {
    let cartItems;
    if (req.body.singleCartId) {
      // Buy single cart product
      cartItems = await CartModel.find({ _id: req.body.singleCartId, userid: req.userid });
      if (!cartItems.length) return res.status(400).json({ msg: "Cart item not found" });
    } else {
      // Buy all cart products
      cartItems = await CartModel.find({ userid: req.userid });
      if (!cartItems.length) return res.status(400).json({ msg: "Cart is empty" });
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.title,
      description: item.description,
      image: Array.isArray(item.image) ? item.image[0] : item.image,
      quantity: item.Qty,
      price: item.afterQtyprice || item.price,
      totalPrice: item.total
    }));

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const shippingAddress = req.body.shippingAddress || 'Default Shipping Address';

    const order = new OrderModel({
      userId: req.userid,
      products: cartItems.map((item) => item.productId),
      orderItems,
      totalAmount,
      shippingAddress
    });

    await order.save();
    // Remove only the bought cart item if single, else all
    if (req.body.singleCartId) {
      await CartModel.deleteOne({ _id: req.body.singleCartId, userid: req.userid });
    } else {
      await CartModel.deleteMany({ userid: req.userid });
    }

    res.json({ msg: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error placing order", error: err.message });
  }
}

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.userid;
    const orderId = req.params.id;
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ ok: false, msg: "Order not found." });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ ok: false, msg: "Order already cancelled." });
    }
    if (order.status === 'completed') {
      return res.status(400).json({ ok: false, msg: "Completed order cannot be cancelled." });
    }
    order.status = 'cancelled';
    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();
    res.json({ ok: true, msg: "Order cancelled successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Failed to cancel order.", error: err.message });
  }
}


// show all orders access only admin
exports.getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
          return res.status(403).json({ msg: "Access denied", ok: false });
        }
        const orders = await OrderModel.find({}).populate("userId");
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch orders", error: err.message });
    }
}