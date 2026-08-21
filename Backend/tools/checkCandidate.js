const mongoose = require('mongoose');
const Candidate = require('../src/models/Candidate');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node checkCandidate.js <email>');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cand = await Candidate.findOne({ email }).lean();
    if (!cand) {
      console.log(`No candidate found for ${email}`);
    } else {
      console.log(JSON.stringify(cand, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
