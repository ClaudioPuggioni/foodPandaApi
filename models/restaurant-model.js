const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

const RestaurantModel = new mongoose.model("Restaurant", restaurantSchema);
module.exports = RestaurantModel;
