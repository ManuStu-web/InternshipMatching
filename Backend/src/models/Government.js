const mongoose = require("mongoose");

const governmentSchema = new mongoose.Schema(
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

        password: {
            type: String,
            required: true,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["admin", "officer"],
            default: "officer",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Government",
    governmentSchema
);