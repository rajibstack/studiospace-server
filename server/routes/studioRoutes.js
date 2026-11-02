const express = require("express");
const router = express.Router();
const { getAllStudios, getStudioById, createStudio, getMyListings } = require("../controllers/studioController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", getAllStudios);
router.get("/my-listings", verifyToken, getMyListings);
router.get("/:id", getStudioById);
router.post("/", verifyToken, createStudio);

module.exports = router;