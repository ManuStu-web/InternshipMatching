const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  registerCandidate,
  getCandidates,
  getCandidateById,
  getMyProfile,
  loginCandidate,
  updateMyProfile,
  saveCandidatePreferences,
  uploadResume,
  getMyAllocations,
  getMyRecommendations,
  submitFeedback,
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.get("/", authMiddleware, roleMiddleware("admin", "officer"), getCandidates);

router.get("/me", authMiddleware, roleMiddleware("candidate"), getMyProfile);
router.put("/me", authMiddleware, roleMiddleware("candidate"), updateMyProfile);
router.put("/me/preferences", authMiddleware, roleMiddleware("candidate"), saveCandidatePreferences);
router.post("/resume", authMiddleware, roleMiddleware("candidate"), upload.single("resume"), uploadResume);
router.get("/me/allocations", authMiddleware, roleMiddleware("candidate"), getMyAllocations);
router.get("/me/recommendations", authMiddleware, roleMiddleware("candidate"), getMyRecommendations);
router.post("/me/feedback", authMiddleware, roleMiddleware("candidate"), submitFeedback);
router.get("/:id", authMiddleware, roleMiddleware("admin", "officer"), getCandidateById);

module.exports = router;
