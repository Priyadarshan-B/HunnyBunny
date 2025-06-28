const mongoose = require("mongoose");
const Counter = require('./Counter')
const BillSchema = new mongoose.Schema({
   bill_number: { type: Number, unique: true, index: true },
  customer_name: { type: String, required: true },
  total_amount: { type: mongoose.Decimal128, required: true },
  payment_method: {
    type: String,
    enum: ["COD", "CARD", "UPI", "CASH"],
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },

  status: { type: String, enum: ["0", "1"], required: true },
  createdAt: { type: Date, default: Date.now },
});

BillSchema.pre("save", async function (next) {
  if (!this.isNew || this.bill_number != null) return next();

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "bill_number" },                
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.bill_number = counter.seq;          
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Bill", BillSchema);
