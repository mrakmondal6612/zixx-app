const { WishlistRouter } = require("./wishlist.routes");
const { BrandRouter } = require("./brands.routes");
const { CartRouter } = require("./carts.routes");
const { OrderRouter } = require("./order.routes");
const { ProductRouter } = require("./products.routes");
const { SearchRouter } = require("./search.routes");
const { UserRouter } = require("./user.routes");
const { ReviewRouter } = require("./reviews.routes");

module.exports = {
  BrandRouter,
  OrderRouter,
  ProductRouter,
  SearchRouter,
  UserRouter,
  WishlistRouter,
  CartRouter,
  ReviewRouter
};