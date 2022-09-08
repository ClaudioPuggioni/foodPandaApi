const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
require("dotenv").config();

const DB_URI = "mongodb+srv://cau:KedQO7t5tUcmXgxJ@cluster0.5z2ih1z.mongodb.net/foodPandaApi?retryWrites=true&w=majority";

const app = express();
// app.use("morgan");

// Cors
app.use(cors());

// Mongoose Connect
mongoose
  .connect(DB_URI, {
    useUnifiedTopology: true,
    // useNewURLParse: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// Routes
const authRouter = require("./routes/auth");
const restaurantRouter = require("./routes/restaurantRoute");
const orderRouter = require("./routes/orderRoute");
const { urlencoded } = require("express");

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(urlencoded({ extended: true }));

// Routing Path
app.use("/auth", authRouter);
app.use("/restaurants", authentication, restaurantRouter);
app.use("/orders", authentication, orderRouter);

app.listen(7777);

function authentication(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader === undefined) return res.status(401).send("No token was provided");

  const token = authHeader.split(" ")[1];
  if (token === undefined) return res.status(401).send("Invalid token");

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userInfo = payload;
    console.log("authentication request with userInfoPayload:", req);
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}
