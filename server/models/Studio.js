const mongoose = require("mongoose");

const studioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    image: { type: String, required: true },
    features: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Studio", studioSchema);