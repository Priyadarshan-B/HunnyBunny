const BillDetail = require("../../models/BillDetail");
const QRProduct = require("../../models/QRProduct"); 


exports.tdy_sold = async (req, res) => {
    const { date, location } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    try {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        const matchStage = {
            createdAt: { $gte: start, $lt: end },
            status: '1',
            ...(location && location !== 'All' && { location: location }),
        };

        const result = await BillDetail.aggregate([
            {
                $match: matchStage
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

        const mapped = result.map(r => ({
            ...r,
            total_price: parseFloat(r.total_price?.toString() || "0")
        }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error("Error fetching today's sales:", error);
        res.status(500).json({ error: "Failed to fetch today's sales" });
    }
};


exports.total_products = async (req, res) => {
  try {
    const result = await QRProduct.aggregate([
      {
        $match: {
          status: "1", 
        },
      },
      {
        $group: {
          _id: null, 
          totalQuantity: { $sum: "$product_quantity" },
totalPrice: {
            $sum: {
              $multiply: [
                "$product_quantity",
                { $convert: { input: "$product_price", to: "double" } }, 
              ],
            },
          },          totalProducts: { $sum: 1 }, 
        },
      },
      {
        $project: {
          _id: 0, 
          totalQuantity: 1,
          totalPrice: 1,
          totalProducts: 1,
        },
      },
    ]);

    const totals = result.length > 0 ? result[0] : { totalQuantity: 0, totalPrice: 0, totalProducts: 0 };

    totals.totalPrice = parseFloat(totals.totalPrice).toFixed(2);

    return res.status(200).json({
      message: "Total product summary fetched successfully",
      data: totals,
    });
  } catch (err) {
    console.error("Error fetching total product summary:", err);
    return res.status(500).json({
      message: "Failed to fetch total product summary",
      error: err.message,
    });
  }
};