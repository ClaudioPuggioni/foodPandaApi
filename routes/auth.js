const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user-model");

router.post("/signup", async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  if (!name || !email || !password || !confirm_password) return res.status(400).send("All fields are required");
  if (password !== confirm_password) return res.status(400).send("Passwords don't match");

  const existingUser = await UserModel.findOne({ email: email });
  if (existingUser !== null) return res.status(403).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("HASH:", hash);

  const newUser = new UserModel({
    name,
    email,
    password: hash,
  });

  try {
    const savedUser = await newUser.save();
    console.log("savedUser return:", savedUser);

    const payload = {
      id: savedUser._id,
      email: savedUser.email,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });

    let createdUser = savedUser.toJSON();
    delete createdUser.password;

    return res.status(201).json({ message: "User created successfully", createdUser, accessToken, refreshToken });
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password, confirm_password } = req.body;

  if (!email || !password || !confirm_password) return res.status(400).send("All fields are required");
  if (password !== confirm_password) return res.status(400).send("Passwords don't match");

  const foundUser = await UserModel.findOne({ email: email });

  if (foundUser !== null) {
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      const payload = {
        id: foundUser._id,
        email: foundUser.email,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });

      let loggedUser = foundUser.toJSON();
      delete loggedUser.password;
      return res.status(200).json({ message: "Logged in successfully", loggedUser, accessToken, refreshToken });
    } else {
      return res.status(400).send("Incorrect password");
    }
  } else {
    return res.status(404).send("Account does not exist");
  }
});

router.post("/token", async (req, res) => {
  const { email } = req.body;
  const refresh_token = req.body.refreshToken;

  if (!refresh_token || !email) return res.status(400).send("All fields are required");

  const foundUser = await UserModel.findOne({ email: email });

  if (!foundUser !== null) {
    try {
      const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
      console.log("TOKENPAYLOAD:", payload);

      const accessToken = jwt.sign({ id: payload.id, email: foundUser.email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      });
      const refreshToken = jwt.sign({ id: payload.id, email: foundUser.email }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      });
      return res.status(202).json({ accessToken, refreshToken });
    } catch (err) {
      return res.status(501).send(err.message);
    }
  } else {
    return res.status(404).send("Account does not exist");
  }
});

module.exports = router;
