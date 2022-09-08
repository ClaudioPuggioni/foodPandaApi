const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    cart: [{ dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true }, quantity: { type: Number, required: true } }],
    total: { type: Number },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const OrderModel = new mongoose.model("Order", orderSchema);
module.exports = OrderModel;
