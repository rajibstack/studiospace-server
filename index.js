const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const authRoutes = require("./server/routes/authRoutes");
const studioRoutes = require("./server/routes/studioRoutes");
const bookingRoutes = require("./server/routes/bookingRoutes");
const wishlistRoutes = require("./server/routes/wishlistRoutes"); 

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://studiospace-client-six.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
  }
  return client.db("studioSpaceDB");
}

app.use(async (req, res, next) => {
  try {
    const db = await connectDB();
    app.locals.db = db;
    next();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes); 

app.get("/", (req, res) => {
  res.send("StudioSpace Server is running");
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB on startup:", error);
  });

module.exports = app;