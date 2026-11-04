const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

// 1. Wishlist Toggle (Add or Remove)
router.post("/toggle", async (req, res) => {
  try {
    const { studioId } = req.body;
    let userEmail = req.user?.email;

    if (!userEmail && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || "secret");
        userEmail = decoded.email;
      } catch (err) {}
    }

    if (!userEmail) {
      userEmail = req.body?.email || req.query?.email;
    }

    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    if (!studioId) {
      return res.status(400).json({ success: false, message: "Studio ID is required" });
    }

    const db = req.app.locals.db;
    const wishlistCollection = db.collection("wishlists");

    let formattedStudioId;
    try {
      formattedStudioId = new ObjectId(studioId);
    } catch (e) {
      formattedStudioId = studioId;
    }

    const existing = await wishlistCollection.findOne({
      userEmail,
      studioId: formattedStudioId,
    });

    if (existing) {
      await wishlistCollection.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, saved: false, message: "Removed from saved spaces" });
    } else {
      await wishlistCollection.insertOne({ userEmail, studioId: formattedStudioId, createdAt: new Date() });
      return res.status(201).json({ success: true, saved: true, message: "Saved to your wishlist!" });
    }
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 2. Get Saved Studio IDs
router.get("/my-ids", async (req, res) => {
  try {
    let userEmail = req.user?.email || req.query?.email;
    if (!userEmail && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || "secret");
        userEmail = decoded.email;
      } catch (err) {}
    }

    if (!userEmail) return res.status(200).json([]);

    const db = req.app.locals.db;
    const wishlists = await db.collection("wishlists").find({ userEmail }).toArray();
    const savedIds = wishlists.map((w) => w.studioId.toString());
    return res.status(200).json(savedIds);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load wishlist IDs" });
  }
});

// 3. Get Full Saved Studios for Wishlist Page
router.get("/my-studios", async (req, res) => {
  try {
    let userEmail = req.user?.email || req.query?.email;
    if (!userEmail && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || "secret");
        userEmail = decoded.email;
      } catch (err) {}
    }

    if (!userEmail) return res.status(200).json([]);

    const db = req.app.locals.db;
    const wishlists = await db.collection("wishlists").find({ userEmail }).toArray();
    const studioIds = wishlists.map((w) => {
      try {
        return new ObjectId(w.studioId);
      } catch (e) {
        return w.studioId;
      }
    });

    const savedStudios = await db.collection("studios").find({ _id: { $in: studioIds } }).toArray();
    return res.status(200).json(savedStudios);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load saved studios" });
  }
});

module.exports = router;