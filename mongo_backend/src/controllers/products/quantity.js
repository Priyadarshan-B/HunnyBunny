const Quantity = require("../../models/Quantity");

exports.get_quantity = async (req, res) => {
  try {
    const result = await Quantity.find(
      { status: '1' },
      { _id: 1, quantity: 1, expansion: 1 }
    );

    const mapped = result.map((item) => ({
      id: item._id,
      quantity: item.quantity,
      expansion: item.expansion
    }));

    return res.status(200).json(mapped);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch quantity" });
  }
};
