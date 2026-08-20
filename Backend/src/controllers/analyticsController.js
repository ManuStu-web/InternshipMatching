const Candidate = require('../models/Candidate');
const Internship = require('../models/Internship');
const Allocation = require('../models/Allocation');
const Feedback = require('../models/Feedback');

const getOverview = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const totalInternships = await Internship.countDocuments();
    const totalAllocations = await Allocation.countDocuments();
    const allocatedCandidates = await Allocation.countDocuments({ status: 'ALLOCATED' });

    // pending/unallocated candidates: candidates without any allocation
    const allocatedCandidateIds = await Allocation.distinct('candidate');
    const unallocatedCandidates = await Candidate.countDocuments({ _id: { $nin: allocatedCandidateIds } });

    const feedbackCount = await Feedback.countDocuments();
    const avgRatingAgg = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const averageRating = (avgRatingAgg[0] && avgRatingAgg[0].avg) ? avgRatingAgg[0].avg : 0;

    return res.status(200).json({
      totalCandidates,
      totalInternships,
      totalAllocations,
      allocatedCandidates,
      unallocatedCandidates,
      feedbackCount,
      averageRating,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

module.exports = { getOverview };
