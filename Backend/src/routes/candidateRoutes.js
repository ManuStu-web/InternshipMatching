const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  registerCandidate,
  getCandidates,
  getMyProfile,
  loginCandidate,
  updateMyProfile,
  uploadResume,
} = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerCandidate);
router.get("/", getCandidates);
router.post("/login", loginCandidate);
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.post("/resume", authMiddleware, upload.single("resume"), uploadResume);

module.exports = router;
