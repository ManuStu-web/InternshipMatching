const mongoose = require("mongoose");

const candidateAuthSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CandidateAuth",
    candidateAuthSchema
);