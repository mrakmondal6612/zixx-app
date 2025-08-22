const express = require("express");
const { getSales } = require("../../controllers/sales.controlers");
const { authenticator } = require("../../middlewares/authenticator.middleware");
const { adminMiddleware } = require("../../middlewares/admin.middleware");
const SalesRouter = express.Router();   

SalesRouter.get("/sales", authenticator, adminMiddleware, getSales);

module.exports = { SalesRouter };
