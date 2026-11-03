const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

exports.register = async (req, res) => {
  try {
    const { name, email, photoURL, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

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

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: result.insertedId, name, email, photoURL },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const decodedToken = jwtDecode(token);
    const { email, name, picture } = decodedToken;
    if (!email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    let user = await usersCollection.findOne({ email });
    if (!user) {
      const newUser = {
        name,
        email,
        photoURL: picture || "",
        password: "",
        authProvider: "google",
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, name, email, photoURL: picture };
    }

    const jwtToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", jwtToken, cookieOptions);

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      ...cookieOptions,
      maxAge: 0,
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");
    const userEmail = req.user?.email;
    const { name, photoURL } = req.body;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await usersCollection.updateOne(
      { email: userEmail },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne({ email: userEmail });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        photoURL: updatedUser.photoURL,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};