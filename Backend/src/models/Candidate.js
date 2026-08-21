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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    socialCategory: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
      default: "General",
    },
    district: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    areaType: {
      type: String,
      enum: ["Rural", "Semi-Urban", "Urban"],
      default: "Urban",
    },
    isAspirationalDistrict: {
      type: Boolean,
      default: false,
    },
    pastBeneficiary: {
      type: Boolean,
      default: false,
    },
    firstGenerationLearner: {
      type: Boolean,
      default: false,
    },
    preferences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
      },
    ],
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
