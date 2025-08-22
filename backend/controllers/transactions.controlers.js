const { Transaction } = require("../models/transaction.model");

exports.Transactions = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    const generalSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
      };
      return sortFormatted;
    };

    const sortFormatted = sort ? generalSort() : {};

    const searchQuery = [];

    if (search) {
      searchQuery.push({ userId: { $regex: search, $options: "i" } });

      if (!isNaN(search)) {
        searchQuery.push({ cost: Number(search) });
      }
    }

    const query = searchQuery.length > 0 ? { $or: searchQuery } : {};

    const transactions = await Transaction.find(query)
      .sort(sortFormatted)
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
