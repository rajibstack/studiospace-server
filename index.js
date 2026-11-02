const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const authRoutes = require("./server/routes/authRoutes");
const studioRoutes = require("./server/routes/studioRoutes");
const bookingRoutes = require("./server/routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");

    const db = client.db("studioSpaceDB");
    app.locals.db = db;

    // Modular Routes Integration
    app.use("/api/auth", authRoutes);
    app.use("/api/studios", studioRoutes);
    app.use("/api/bookings", bookingRoutes);

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

app.get("/", (req, res) => {
  res.send("StudioSpace Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

startServer();