const express = require("express");
const { 
    adminRouter, 
    dashboardRouter, 
    SalesRouter, 
    TransactionRouter, 
    GeographyRouter,
    ProductAdminRouter
} = require("./Admin");

const AdminsRouters = express.Router();

AdminsRouters.use("/admin", adminRouter);
AdminsRouters.use("/admin", dashboardRouter);
AdminsRouters.use("/admin", SalesRouter);
AdminsRouters.use("/admin", TransactionRouter);
AdminsRouters.use("/admin", GeographyRouter);
AdminsRouters.use("/admin", ProductAdminRouter);

AdminsRouters.get("/", (req, res) => {
  res.send("Welcome to the Admin API");
});


module.exports = AdminsRouters;