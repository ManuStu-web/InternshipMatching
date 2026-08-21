const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
    {
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true
        },

        score: {
            type: Number,
            required: true
        },

        breakdown: {
            skills: {
                type: Number,
                default: 0
            },

            eligibility: {
                type: Number,
                default: 0
            },

            role: {
                type: Number,
                default: 0
            },

            location: {
                type: Number,
                default: 0
            },

            sector: {
                type: Number,
                default: 0
            },

            experience: {
                type: Number,
                default: 0
            },

            affirmative: {
                type: Number,
                default: 0
            },

            preference: {
                type: Number,
                default: 0
            }
        },

        reasonSummary: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["ALLOCATED", "WAITLIST"],
            required: true
        },

        acceptanceStatus: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "DECLINED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Allocation",
    allocationSchema
);