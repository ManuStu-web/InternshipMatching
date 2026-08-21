// Quick admin feedback fetch script
// Usage: node Backend\scripts\fetch_admin_feedback.js

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env from Backend/.env if present
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih25033';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Ensure related models are registered so populate() works
    try { require('../src/models/Candidate'); } catch (e) { /* ignore if model file missing */ }
    try { require('../src/models/Internship'); } catch (e) { /* ignore if model file missing */ }
    const Feedback = require('../src/models/Feedback');

    // Fetch recent feedbacks (limit to 200). Populate candidate and internship references if available.
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('candidate')
      .populate('internship')
      .lean()
      .exec();

    const output = {
      count: feedbacks.length,
      recent: feedbacks,
    };

    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error('Error fetching feedback:', err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main();
