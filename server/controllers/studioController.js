const { ObjectId } = require("mongodb");

exports.createStudio = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");

    const newStudio = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await studiosCollection.insertOne(newStudio);
    return res.status(201).json({
      message: "Studio created successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to create studio" });
  }
};

exports.getAllStudios = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const studios = await studiosCollection.find({}).toArray();
    return res.status(200).json(studios);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getFeaturedStudios = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const studios = await studiosCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    return res.status(200).json(studios);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getStudioById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const { id } = req.params;

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const studio = await studiosCollection.findOne(query);
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    return res.status(200).json(studio);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const myStudios = await studiosCollection
      .find({
        $or: [
          { ownerEmail: userEmail },
          { userEmail: userEmail },
          { "owner.email": userEmail }
        ]
      })
      .toArray();

    return res.status(200).json(myStudios);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.updateStudio = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const { id } = req.params;
    const userEmail = req.user?.email;

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const studio = await studiosCollection.findOne(query);
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    if (studio.ownerEmail !== userEmail && studio.userEmail !== userEmail && studio.owner?.email !== userEmail) {
      return res.status(403).json({ message: "Forbidden: You can only update your own studio" });
    }

    const { title, location, price, image, description, category, securityDeposit, maxCapacity, amenities, overview } = req.body;
    const updatedDoc = {
      $set: {
        title,
        location,
        price,
        image,
        description,
        category,
        securityDeposit,
        maxCapacity,
        amenities,
        overview,
        updatedAt: new Date(),
      },
    };

    await studiosCollection.updateOne(query, updatedDoc);
    return res.status(200).json({ message: "Studio updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.deleteStudio = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studiosCollection = db.collection("studios");
    const { id } = req.params;
    const userEmail = req.user?.email;

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const studio = await studiosCollection.findOne(query);
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    if (studio.ownerEmail !== userEmail && studio.userEmail !== userEmail && studio.owner?.email !== userEmail) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own studio" });
    }

    await studiosCollection.deleteOne(query);
    return res.status(200).json({ message: "Studio deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};