const BillDetail = require("../../models/BillDetail");

exports.tdy_sold = async (req, res) => {
    const date = req.query.date;
    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    try {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        const result = await BillDetail.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lt: end },
                    status: '1'
                }
            },
            {
                $group: {
                    _id: "$product_name",
                    quantity: { $sum: "$quantity" },
                    total_price: { $sum: "$total_price" }
                }
            },
            {
                $project: {
                    product_name: "$_id",
                    quantity: 1,
                    total_price: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching today's sales:", error);
        res.status(500).json({ error: "Failed to fetch today's sales" });
    }
};
