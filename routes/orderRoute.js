const express = require("express");
const DishModel = require("../models/dish-model");
const OrderModel = require("../models/order-model");
const RestaurantModel = require("../models/restaurant-model");
const router = express.Router();

// Create Order
router.post("/", async (req, res) => {
  const { customer, restaurant, cart } = req.body;

  if (!customer || !restaurant || !cart) return res.status(500).send("All fields required");
  if (cart.length == 0) return res.status(500).send("Cannot create empty order");

  let total = 0;
  for (const idx in cart) {
    console.log(cart[idx].dish);
    let dish = await DishModel.findOne({ _id: cart[idx].dish });
    // let dish = await DishModel.find();
    // console.log(dish);
    if (dish !== null) {
      console.log("DISH:", dish.price);
      total += dish.price * cart[idx].quantity;
    } else {
      return res.status(500).send(`${cart[idx]} dish not found`);
    }
  }

  const newOrder = new OrderModel({
    customer,
    restaurant,
    cart,
    total,
  });

  const savedOrder = await newOrder.save();

  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { _id: restaurant },
      { $addToSet: { orders: savedOrder._id } },
      { returnDocument: "after" }
    );
    return res.status(200).json({ message: "Order received successfully", updatedRestaurant });
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

// Get Details of One Order
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  console.log("ORDERID:", id);

  const foundOrder = await OrderModel.findOne({ _id: id });
  if (foundOrder !== null) {
    return res.status(200).json(foundOrder);
  } else {
    return res.status(500).send("Order not found");
  }
});

// Change Status of One Order
router.post("/:id/update", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  console.log("ORDERID:", id);
  console.log("NEWSTATUS:", status);

  try {
    const updatedOrder_status = await OrderModel.findOneAndUpdate({ _id: id }, { status: status }, { returnDocument: "after" });
    console.log("RESTAURANT STATUS UPDATED:", updatedOrder_status);
    return res.status(200).send("Order status changed successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

module.exports = router;
