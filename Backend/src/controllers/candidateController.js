const Candidate = require("../models/Candidate");
const CandidateAuth = require("../models/CandidateAuth");
const Allocation = require("../models/Allocation");
const Internship = require("../models/Internship");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { calculateMatchScore } = require("../services/matchingService");

//registration
const registerCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      education,
      skills,
      preferredLocations,
      preferredRoles,
      preferredSectors,
      experience,
      eligibility,
    } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, email, password and phone are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Check whether candidate already exists
    const existingCandidate = await Candidate.findOne({ email });

    if (existingCandidate) {
      return res.status(400).json({
        message: "Candidate already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create candidate profile
    const candidate = await Candidate.create({
      name,
      email,
      phone,
      education,
      skills,
      preferredLocations,
      preferredRoles,
      preferredSectors,
      experience,
      eligibility,
    });

    // Create authentication record
    await CandidateAuth.create({
      email,
      password: hashedPassword,
      candidate: candidate._id,
    });

    res.status(201).json({
      message: "Candidate registered successfully",
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Candidate registration failed",
      error: error.message,
    });
  }
};

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();

    res.status(200).json({
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch candidates",
      error: err.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    res.status(200).json({
      message: "Candidate profile fetched successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

const getMyAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find({ candidate: req.user.id })
      .populate("internship", "title organization location role sector availableSeats totalSeats")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Candidate allocations fetched successfully",
      count: allocations.length,
      allocations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch allocations",
      error: error.message,
    });
  }
};

const getMyRecommendations = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    const internships = await Internship.find({ status: { $ne: "closed" } });

    const recommendations = internships
      .map((internship) => {
        const result = calculateMatchScore(candidate, internship);
        return {
          internship,
          score: result.totalScore,
          breakdown: result.breakdown,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      message: "Recommendations fetched successfully",
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find candidate authentication record
    const candidateAuth = await CandidateAuth.findOne({ email });

    if (!candidateAuth) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      candidateAuth.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: candidateAuth.candidate,
        role: "candidate",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // Get candidate profile
    const candidate = await Candidate.findById(candidateAuth.candidate);

    res.status(200).json({
      message: "Login successful",
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      education,
      skills,
      preferredLocations,
      experience,
      eligibility,
      preferredRoles,
      preferredSectors,
    } = req.body;

    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    if (name !== undefined) candidate.name = name;
    if (phone !== undefined) candidate.phone = phone;
    if (education !== undefined) candidate.education = education;
    if (skills !== undefined) candidate.skills = skills;
    if (preferredLocations !== undefined) {
      candidate.preferredLocations = preferredLocations;
    }
    if (experience !== undefined) candidate.experience = experience;
    if (eligibility !== undefined) candidate.eligibility = eligibility;
    if (preferredRoles !== undefined) {
      candidate.preferredRoles = preferredRoles;
    }

    if (preferredSectors !== undefined) {
      candidate.preferredSectors = preferredSectors;
    }

    await candidate.save();

    res.status(200).json({
      message: "Profile updated successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    // Save uploaded resume path
    candidate.resumeUrl = req.file.path;

    await candidate.save();

    // Create form data for Python API
    const formData = new FormData();

    formData.append("file", fs.createReadStream(req.file.path));

    // Send resume to Python parser
    const parserBaseUrl = process.env.PARSER_BASE_URL || "http://localhost:8000";

    const parserResponse = await axios.post(
      `${parserBaseUrl}/parse-resume`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    const parsedData = parserResponse.data;

    // Update candidate with parsed information
    if (parsedData.skills) {
      candidate.skills = parsedData.skills;
    }

    if (parsedData.education) {
      candidate.education = parsedData.education;
    }

    if (parsedData.experience !== undefined) {
      candidate.experience = parsedData.experience;
    }

    await candidate.save();

    res.status(200).json({
      message: "Resume uploaded and parsed successfully",

      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        education: candidate.education,
        experience: candidate.experience,
        resumeUrl: candidate.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Resume parsing error:", error.message);

    res.status(500).json({
      message: "Resume processing failed",
      error: error.message,
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    
    // As per Phase 5 instructions, we are NOT modifying MongoDB schemas 
    // to persist feedback yet. We'll simulate a successful submission.
    
    console.log(`[Feedback Received] Candidate: ${req.user.id}, Rating: ${rating}, Text: ${feedback}`);

    res.status(200).json({
      message: "Feedback submitted successfully. Thank you for your input!"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};
module.exports = {
  registerCandidate,
  getCandidates,
  getMyProfile,
  getMyAllocations,
  getMyRecommendations,
  loginCandidate,
  updateMyProfile,
  uploadResume,
  submitFeedback,
};
