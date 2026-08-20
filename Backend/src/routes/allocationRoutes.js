const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  runAllocation,
  getAllocationResults,
} = require("../controllers/allocationController");

const router = express.Router();

router.post(
  "/run/:internshipId",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  runAllocation,
);

router.get(
  "/internship/:internshipId",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  getAllocationResults,
);

module.exports = router;
