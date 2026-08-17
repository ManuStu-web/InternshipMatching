const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    education: {
      degree: String,
      branch: String,
      college: String,
      graduationYear: Number,
    },
    skills: {
      type: [String],
      default: [],
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    preferredRoles: {
      type: [String],
      default: [],
    },

    preferredSectors: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    eligibility: {
      type: Boolean,
      default: true,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Candidate", candidateSchema);
