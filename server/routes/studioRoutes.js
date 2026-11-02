const express = require("express");
const router = express.Router();
const { 
  getAllStudios,
  getFeaturedStudios,
  createStudio, 
  getMyListings, 
  updateStudio, 
  deleteStudio 
} = require("../controllers/studioController");
const verifyToken = require("../middleware/verifyToken");

// Public routes
router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);

// Protected routes
router.post("/", verifyToken, createStudio);
router.get("/my-listings", verifyToken, getMyListings);
router.put("/:id", verifyToken, updateStudio);
router.delete("/:id", verifyToken, deleteStudio);

module.exports = router;