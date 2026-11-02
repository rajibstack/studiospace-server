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
    return res.status(200).json(studio);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.createStudio = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const ownerIdentifier = req.user?.email || req.user?.userId || req.user?.id;
    const newStudio = {
      ...req.body,
      ownerEmail: ownerIdentifier,
    };
    const result = await db.collection("studios").insertOne(newStudio);
    return res.status(201).json({ message: "Studio created successfully", insertedId: result.insertedId, ...newStudio });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getMyListings = async (postReq, res) => {
  try {
    const db = postReq.app.locals.db;
    const ownerIdentifier = postReq.user?.email || postReq.user?.userId || postReq.user?.id;

    const studios = await db.collection("studios").find({
      $or: [
        { ownerEmail: postReq.user?.email },
        { ownerEmail: postReq.user?.userId },
        { ownerEmail: postReq.user?.id }
      ]
    }).toArray();

    return res.status(200).json({ studios });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};