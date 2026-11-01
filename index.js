const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("studioSpaceDB");
    const usersCollection = db.collection("users");

    app.post("/api/auth/register", async (req, res) => {
      const { name, email, photoURL, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email,
        photoURL: photoURL || "",
        password: hashedPassword,
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      const token = jwt.sign({ email, id: result.insertedId }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: result.insertedId, name, email, photoURL },
      });
    });

    app.post("/api/auth/login", async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
      });
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("StudioSpace Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});