require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mailRoutes = require("./mail");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined })
  .then(() => console.log("Mongo connected"))
  .catch((e) => console.error("Mongo error", e));

app.use("/api", mailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));