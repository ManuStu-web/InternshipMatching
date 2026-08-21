const mongoose = require('mongoose');
const Internship = require('../src/models/Internship');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const docs = await Internship.find().lean();
    console.log(JSON.stringify(docs, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
