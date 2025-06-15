const { post_database, get_database } = require("../../config/db_utils");

exports.post_bill = async (req, res) => {
  try {
    const { bill_id, customer_name, total_amount, payment_method, items } =
      req.body;

    if (
      !bill_id ||
      !customer_name ||
      !total_amount ||
      !payment_method ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const billQuery = `
            INSERT INTO bills (bill_id, customer_name, toatal_amount, payment_method, status)
            VALUES (?, ?, ?, ?, '1', CURRENT_TIMESTAMP)
        `;
    const billParams = [bill_id, customer_name, total_amount, payment_method];
    const billResult = await post_database(billQuery, billParams);

    const insertedBillId = billResult.insertId;

    const detailQuery = `
            INSERT INTO bill_details (bill_id, product_name, quantity, unit_price, total_price, status, )
            VALUES ?
        `;

    const detailValues = items.map((item) => [
      insertedBillId,
      item.product_name,
      item.quantity,
      item.unit_price,
      item.unit_price * item.quantity,
      "1",
      new Date(),
    ]);

    await post_database(detailQuery, [detailValues]);

    res.status(200).json({ message: "Bill and items saved successfully" });
  } catch (error) {
    console.error("Error inserting bill:", error);
    res.status(500).json({ error: "Failed to insert bill and items" });
  }
};

exports.get_bills = async (req, res) => {
  try {
    const { name, bill_id } = req.query;

    let query = `
      SELECT 
        b.id AS bill_id,
        b.bill_id AS external_bill_id,
        b.customer_name,
        b.toatal_amount,
        b.payment_method,
        b.createdAt AS bill_created_at,
        d.id AS item_id,
        d.product_name,
        d.quantity,
        d.unit_price,
        d.total_price,
        d.createdAt AS item_created_at
      FROM 
        bills b
      JOIN 
        bill_details d ON b.id = d.bill_id
      WHERE 
        b.status = '1'
    `;

    const params = [];

    if (name) {
      query += ` AND b.customer_name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (bill_id) {
      query += ` AND b.bill_id LIKE ?`;
      params.push(`%${bill_id}%`);
    }

    const result = await get_database(query, params);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};
