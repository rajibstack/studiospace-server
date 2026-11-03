const express = require("express");
const router = express.Router();
const { 
  getAllStudios,
  getFeaturedStudios,
  getStudioById,
  getMyListings,
  createStudio, 
  updateStudio, 
  deleteStudio 
} = require("../controllers/studioController");
const verifyToken = require("../middleware/verifyToken");

// Public routes
router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);

router.get("/my-listings", verifyToken, getMyListings);

// Dynamic ID route
router.get("/:id", getStudioById);

// Protected routes
router.post("/", verifyToken, createStudio);
router.put("/:id", verifyToken, updateStudio);
router.delete("/:id", verifyToken, deleteStudio);

module.exports = router;