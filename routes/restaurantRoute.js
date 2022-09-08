const express = require("express");
const DishModel = require("../models/dish-model");
const OrderModel = require("../models/order-model");
const RestaurantModel = require("../models/restaurant-model");
const router = express.Router();

// Create Restaurant
router.post("/", async (req, res) => {
  const { name, dishes } = req.body;
  if (!name) return res.status(500).send("Restaurant name is required");

  const newRestaurant = new RestaurantModel({
    name,
    dishes,
  });

  try {
    const savedRestaurant = await newRestaurant.save();
    console.log("SAVED RESTAURANT:", savedRestaurant);
    return res.status(200).send("Restaurant saved successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

// Delete Restaurant
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const deletedRestaurant = await RestaurantModel.deleteOne({ _id: id });
  if (deletedRestaurant.deletedCount > 0) {
    return res.status(200).send("Restaurant deleted successfully");
  } else {
    return res.status(500).send("Restaurant not found");
  }
});

// List All Restaurants
router.get("/", async (req, res) => {
  const allRestaurants = await RestaurantModel.find();
  return res.status(200).json(allRestaurants);
});

// Get One Restaurant's Details
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const foundRestaurant = await RestaurantModel.findOne({ _id: id });

  if (foundRestaurant !== null) {
    return res.status(200).json(foundRestaurant);
  } else {
    return res.status(500).send("Restaurant not found");
  }
});

// Add Dish to One Restaurant
router.post("/:id/add-dish", async (req, res) => {
  const { name, price } = req.body;
  const id = req.params.id;

  const newDish = new DishModel({
    name,
    price,
  });

  const savedDish = await newDish.save();

  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate({ _id: id }, { $addToSet: { dishes: savedDish } }, { returnDocument: "after" });
    return res.status(201).json({ message: "Dish added successfully", updatedRestaurant });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Get All Orders of One Restaurant
router.get("/:id/orders", async (req, res) => {
  const id = req.params.id;

  const foundRestaurant = await RestaurantModel.findOne({ _id: id });

  if (foundRestaurant !== null) {
    let orders = [];
    for (const idx in foundRestaurant.orders) {
      const foundOrder = await OrderModel.findOne({ _id: foundRestaurant.orders[idx] });
      orders.push(foundOrder);
    }

    return res.status(200).json(orders);
  } else {
    return res.status(500).send("Restaurant not found");
  }
});

// Get Revenue of One Restaurant [with date range]
router.get("/:id/revenue", async (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  console.log(req.params);
  //
});

module.exports = router;
