const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  runAllocation,
  runGlobalAllocation,
  getAllocationResults,
  getAllAllocations,
  getAllocationMetrics,
  updateAllocationAcceptance,
  resetAllocations,
} = require("../controllers/allocationController");

const router = express.Router();

// Government / Admin Routes
router.post(
  "/reset",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  resetAllocations,
);

router.delete(
  "/reset",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  resetAllocations,
);

router.post(
  "/run-global",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  runGlobalAllocation,
);

router.post(
  "/run/:internshipId",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  runAllocation,
);

router.get(
  "/metrics",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  getAllocationMetrics,
);

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  getAllAllocations,
);

router.get(
  "/internship/:internshipId",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  getAllocationResults,
);

// Candidate Offer Acceptance / Decline Route
router.patch(
  "/:allocationId/acceptance",
  authMiddleware,
  roleMiddleware("candidate"),
  updateAllocationAcceptance,
);

module.exports = router;
