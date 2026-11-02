const express = require("express");
const router = express.Router();
const { register, login, googleLogin, updateUserProfile } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.put("/profile", verifyToken, updateUserProfile);

module.exports = router;