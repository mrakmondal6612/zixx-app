const express = require("express");
const { 
    BrandRouter, 
    CartRouter, 
    OrderRouter, 
    ProductRouter, 
    SearchRouter,
    UserRouter,
    WishlistRouter,
    ReviewRouter
} = require("./Client");

const ClientsRouters = express.Router();

ClientsRouters.use("/clients", BrandRouter);
ClientsRouters.use("/clients", CartRouter);
ClientsRouters.use("/clients", OrderRouter);
ClientsRouters.use("/clients", ProductRouter);
ClientsRouters.use("/clients", ReviewRouter);
ClientsRouters.use("/clients", SearchRouter);
ClientsRouters.use("/clients", UserRouter);
ClientsRouters.use("/clients", WishlistRouter);


ClientsRouters.get("/clients", (req, res) => {
  res.send("Welcome to the Clients API");
});


module.exports = ClientsRouters;