const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createInternship,
  getInternship,
  getInternshipById,
} = require("../controllers/internshipController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "officer"),
  createInternship,
);
router.get("/", getInternship);
router.get("/:internshipId", getInternshipById);


module.exports = router;
