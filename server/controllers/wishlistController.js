const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const toggleWishlist = async (req, res) => {
  try {
    const { studioId } = req.body;
    let userEmail = req.user?.email;

    if (!userEmail && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        userEmail = decoded.email;
      } catch (err) {
        console.error("Token verification failed:", err.message);
      }
    }

    if (!userEmail) {
      userEmail = req.body.email || req.query.email;
    }

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!studioId) {
      return res.status(400).json({ message: "Studio ID is required" });
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
      return res.status(200).json({
        success: true,
        saved: false,
        message: "Removed from saved spaces",
      });
    } else {
      await wishlistCollection.insertOne({
        userEmail,
        studioId: formattedStudioId,
        createdAt: new Date(),
      });
      return res.status(201).json({
        success: true,
        saved: true,
        message: "Saved to your wishlist!",
      });
    }
  } catch (err) {
    console.error("Wishlist error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get User's Saved Studio IDs
const getMyWishlistIds = async (req, res) => {
  try {
    let userEmail = req.user?.email;

    if (!userEmail && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        userEmail = decoded.email;
      } catch (err) {}
    }

    if (!userEmail) {
      userEmail = req.query.email;
    }

    if (!userEmail) {
      return res.status(200).json([]);
    }

    const db = req.app.locals.db;
    const wishlistCollection = db.collection("wishlists");

    const wishlists = await wishlistCollection
      .find({ userEmail })
      .toArray();

    const savedStudioIds = wishlists.map((w) => w.studioId.toString());
    res.status(200).json(savedStudioIds);
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
};

module.exports = { toggleWishlist, getMyWishlistIds };