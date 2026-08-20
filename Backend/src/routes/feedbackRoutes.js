const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackForInternship,
} = require('../controllers/feedbackController');

// Candidate
router.post('/', auth, role('candidate'), createFeedback);
router.get('/me', auth, role('candidate'), getMyFeedback);

// Government
router.get('/', auth, role('admin','officer'), getAllFeedback);
router.get('/internship/:id', auth, role('admin','officer'), getFeedbackForInternship);

module.exports = router;
