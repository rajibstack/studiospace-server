const express = require("express");
const router = express.Router();
const { register, login, googleLogin, updateUserProfile, logout } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.put("/profile", verifyToken, updateUserProfile);

module.exports = router;