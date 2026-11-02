const { ObjectId } = require("mongodb");

exports.getAllStudios = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studios = await db.collection("studios").find({}).toArray();
    return res.status(200).json({ studios });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getStudioById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studio = await db.collection("studios").findOne({ _id: new ObjectId(req.params.id) });
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }
    return res.status(200).json({ studio });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};