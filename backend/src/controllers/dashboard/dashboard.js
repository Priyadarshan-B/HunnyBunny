const { post_database, get_database } = require("../../config/db_utils");
exports.tdy_sold = async (req, res) => {
    const date = req.query.date;
    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }
  try {
    const query = `
     SELECT product_name, SUM(quantity) AS quantity, SUM(total_price) AS total_price 
     FROM bill_details WHERE DATE(createdAt) = ? AND STATUS = ?
     GROUP BY product_name;
    `;
    const params = [date, '1'];
    const result = await get_database(query, params);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching today's sales:", error);
    return res.status(500).json({ error: "Failed to fetch today's sales" });
  }
}