const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const url = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.mongodb.net/places?retryWrites=true&w=majority&appName=Cluster0`;
const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes); // => /api/places/..
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Could not find this route.");
  error.code = 404;
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to the database!");
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
