const {OverallStatModel } = require("../models/overallStat.model");
exports.getSales = async (req, res) => {
  try {
    const overallStats = await OverallStatModel.find();
    // Get the overall sales statistics
    if (!overallStats || overallStats.length === 0) {
      return res.status(404).json({ message: "No sales data found" });
    }

    // implement here sales functionality
    const salesData = overallStats.map(stat => ({
      product: stat.product,
      totalSales: stat.totalSales,
      totalOrders: stat.totalOrders,
      totalCustomers: stat.totalCustomers
    }));

    // implement here sales statistics aggregation
    const salesStats = overallStats.reduce((acc, stat) => {
      acc.totalSales += stat.totalSales;
      acc.totalOrders += stat.totalOrders;
      acc.totalCustomers += stat.totalCustomers;
      return acc;
    }, {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0
    });
    console.log("Overall Stats:", overallStats);
    res.status(200).json(salesStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
