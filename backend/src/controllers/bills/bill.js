const { get_database,post_database } = require("../../config/db_utils");

exports.post_bill = async (req, res) => {
  try {
    const { customer_name, total_amount, payment_method, items } = req.body;

    if (
      !customer_name ||
      !total_amount ||
      !payment_method ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const billQuery = `
      INSERT INTO bills (customer_name, total_amount, payment_method, status, createdAt)
      VALUES (?, ?, ?, '1', CURRENT_TIMESTAMP)
    `;
    const billParams = [customer_name, total_amount, payment_method];
    const billResult = await post_database(billQuery, billParams);
    console.log("Bill insert result:", billResult); 
    const insertedBillId = billResult.result.insertId;
    console.log("Inserted Bill ID:", insertedBillId);

    const detailQuery = `
      INSERT INTO bill_details (bill_id, product_name, quantity, unit_price, total_price, status, createdAt)
      VALUES ?
    `;

    const detailValues = items.map((item) => [
      insertedBillId,
      item.product_name,
      item.quantity,
      item.unit_price,
      item.unit_price * item.quantity,
      "1",
      new Date()
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
        b.customer_name,
        b.total_amount,
        b.payment_method,
        b.createdAt AS bill_created_at,
        d.product_name,
        d.quantity,
        d.unit_price
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
      query += ` AND b.id LIKE ?`;
      params.push(`%${bill_id}%`);
    }

    const rows = await get_database(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No matching bills found" });
    }

    const billMap = {};

    for (const row of rows) {
      if (!billMap[row.bill_id]) {
        billMap[row.bill_id] = {
          bill_id: row.bill_id,
          customer_name: row.customer_name,
          total_amount: parseFloat(row.total_amount),
          payment_method: row.payment_method,
          date: row.bill_created_at,
          items: []
        };
      }

      billMap[row.bill_id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        unit_price: parseFloat(row.unit_price)
      });
    }

    const bills = Object.values(billMap);

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};
