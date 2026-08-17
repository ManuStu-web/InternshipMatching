
const Internship = require("../models/Internship");

const createInternship = async (req, res) => {
    try {
        const {
            title,
            organization,
            description,
            requiredSkills,
            role,
            location,
            sector,
            requiredExperience,
            eligibilityCriteria,
            totalSeats,
            applicationDeadline
        } = req.body;

        if (
            !title ||
            !organization ||
            !requiredSkills ||
            !role ||
            !location ||
            !sector
        ) {
            return res.status(400).json({
                message:
                    "Title, organization, requiredSkills, role, location and sector are required"
            });
        }

        if (
            totalSeats === undefined ||
            totalSeats === null ||
            totalSeats < 1
        ) {
            return res.status(400).json({
                message: "totalSeats must be at least 1"
            });
        }

        if (
            typeof totalSeats !== "number" ||
            totalSeats < 1
        ) {
            return res.status(400).json({
                message: "totalSeats must be a number greater than 0"
            });
        }

        if (!Array.isArray(requiredSkills)) {
            return res.status(400).json({
                message: "requiredSkills must be an array"
            });
        }

        const internship = await Internship.create({
            title,
            organization,
            description,
            requiredSkills,
            role,
            location,
            sector,
            requiredExperience,
            eligibilityCriteria,
            totalSeats,
            availableSeats: totalSeats,
            applicationDeadline
        });

        res.status(201).json({
            message: "Internship created successfully",
            internship
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create internship",
            error: error.message
        });
    }
};
const getInternship = async (req, res) => {
    try {
        const internship = await Internship.find();

        res.status(200).json({
            count: internship.length,
            internship
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch Internships",
            error: err.message
        });
    }
};

const getInternshipById = async (req, res) => {
    try {
        const { internshipId } = req.params;

        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        res.status(200).json({
            internship
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch internship",
            error: error.message
        });
    }
};




module.exports = {
    createInternship, getInternship,getInternshipById
};