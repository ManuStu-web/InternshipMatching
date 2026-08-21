const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Allocation',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate feedback from same candidate for same internship
feedbackSchema.index({ candidate: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
