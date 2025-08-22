const express = require("express");
const { 
    buyCartProducts, 
    getUserOrders, 
    cancelOrder,
    getAllOrders
} = require("../../controllers/order.controlers");
const { authenticator } = require("../../middlewares/authenticator.middleware");

const OrderRouter = express.Router();

// Buy cart products
OrderRouter.post("/order/buy", authenticator, buyCartProducts);

// Get user orders
OrderRouter.get("/user/orders", authenticator, getUserOrders);

// Cancel order
OrderRouter.patch("/order/cancel/:id", authenticator, cancelOrder);


module.exports = { OrderRouter };
