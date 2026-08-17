const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: true,
    },
    eligibilityCriteria: {
      degrees: {
        type: [String],
        default: []
      },

      branches: {
        type: [String],
        default: []
      },

      minGraduationYear: {
        type: Number,
        default: null
      }
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },

    sector: {
      type: String,
      trim: true,
      default: "",
    },

    requiredExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Internship", internshipSchema);
