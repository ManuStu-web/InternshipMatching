const Feedback = require('../models/Feedback');
const Allocation = require('../models/Allocation');
const Candidate = require('../models/Candidate');
const Internship = require('../models/Internship');

// Create feedback (candidate only)
const createFeedback = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { internshipId, allocationId, rating, comment } = req.body;

    if (!internshipId || !rating) {
      return res.status(400).json({ message: 'internshipId and rating are required' });
    }

    // Verify candidate was allocated to this internship
    const allocation = await Allocation.findOne({ candidate: candidateId, internship: internshipId });

    if (!allocation) {
      return res.status(403).json({ message: 'Candidate is not allocated to this internship' });
    }

    // Prevent duplicates
    const existing = await Feedback.findOne({ candidate: candidateId, internship: internshipId });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted for this internship' });
    }

    const feedback = await Feedback.create({
      candidate: candidateId,
      internship: internshipId,
      allocation: allocationId || allocation._id,
      rating,
      comment,
    });

    return res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    console.error('createFeedback error:', error.message);
    return res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

// Get own feedbacks (candidate)
const getMyFeedback = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const feedbacks = await Feedback.find({ candidate: candidateId })
      .populate('internship', 'title organization location role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: feedbacks.length, feedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// Admin: get all feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('candidate', 'name email')
      .populate('internship', 'title organization')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: feedbacks.length, feedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// Admin: get feedback for internship with stats
const getFeedbackForInternship = async (req, res) => {
  try {
    const internshipId = req.params.id;

    const feedbacks = await Feedback.find({ internship: internshipId })
      .populate('candidate', 'name')
      .sort({ createdAt: -1 });

    const count = feedbacks.length;
    const avg = count ? feedbacks.reduce((s, f) => s + f.rating, 0) / count : 0;

    // distribution
    const distribution = { 1:0,2:0,3:0,4:0,5:0 };
    feedbacks.forEach(f => {
      distribution[f.rating] = (distribution[f.rating] || 0) + 1;
    });

    return res.status(200).json({ count, averageRating: avg, distribution, recent: feedbacks.slice(0,10) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch internship feedback', error: error.message });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackForInternship,
};
