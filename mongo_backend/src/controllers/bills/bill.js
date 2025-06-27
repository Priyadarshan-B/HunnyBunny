const Bill = require("../../models/Bill");
const BillDetail = require("../../models/BillDetail");
const { update_stock } = require("../../controllers/products/stocks");

exports.post_bill = async (req, res) => {
  try {
    const { customer_name, total_amount, payment_method, items, location } = req.body;

    if (
      !customer_name ||
      !total_amount ||
      !payment_method ||
      !items ||
      !location ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save Bill
    const newBill = new Bill({
      customer_name,
      total_amount,
      payment_method,
      location,
      status: '1'
    });

    const savedBill = await newBill.save();

    // Save Bill Details
    const detailDocs = items.map((item) => ({
      bill_id: savedBill._id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      location: location,
      status: '1',
      createdAt: new Date()
    }));

    await BillDetail.insertMany(detailDocs);

    // Update stock
    for (const item of items) {
      const result = await update_stock(item.product_name, item.quantity);
      console.log(`Stock updated for ${item.product_name}:`, result);
    }

    return res.status(200).json({ message: "Bill and items saved successfully" });
  } catch (error) {
    console.error("Error inserting bill:", error);
    return res.status(500).json({ error: "Failed to insert bill and items" });
  }
};

exports.get_bills = async (req, res) => {
  try {
    const { name, bill_id, location } = req.query;

    const query = {
      status: '1',
      ...(name ? { customer_name: { $regex: name, $options: 'i' } } : {}),
      ...(bill_id ? { _id: { $regex: bill_id, $options: 'i' } } : {}),
      ...(location ? { location } : {})
    };

    const bills = await Bill.find(query).lean();

    if (!bills.length) {
      return res.status(404).json({ message: "No matching bills found" });
    }

    const billIds = bills.map(b => b._id);

    const details = await BillDetail.find({ bill_id: { $in: billIds } });

    const billMap = {};

    bills.forEach(bill => {
      billMap[bill._id] = {
        bill_id: bill._id,
        customer_name: bill.customer_name,
        total_amount: parseFloat(bill.total_amount.toString()),
        payment_method: bill.payment_method,
        date: bill.createdAt,
        location: bill.location,
        items: []
      };
    });

    details.forEach(detail => {
      if (billMap[detail.bill_id]) {
        billMap[detail.bill_id].items.push({
          product_name: detail.product_name,
          quantity: detail.quantity,
          location: detail.location,
          unit_price: parseFloat(detail.unit_price.toString())
        });
      }
    });

    res.status(200).json(Object.values(billMap));
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};
