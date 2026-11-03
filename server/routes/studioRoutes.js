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

router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);

router.get("/my-listings", verifyToken, getMyListings);
router.get("/:id", getStudioById);

router.post("/", verifyToken, createStudio);
router.put("/:id", verifyToken, updateStudio);
router.patch("/:id", verifyToken, updateStudio); 
router.delete("/:id", verifyToken, deleteStudio);

module.exports = router;