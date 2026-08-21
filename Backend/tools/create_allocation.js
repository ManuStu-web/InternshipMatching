const mongoose = require('mongoose');
const Allocation = require('../src/models/Allocation');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih25033';

async function run() {
  await mongoose.connect(MONGO);
  const alloc = await Allocation.create({
    internship: '6a85d36b2afa181fe3f540c6',
    candidate: '6a8724b6072dc0a6fdae14ba',
    score: 50,
    breakdown: { skills: 50, eligibility: 100, role: 0, location: 0, sector: 0, experience: 0 },
    status: 'ALLOCATED'
  });
  console.log('created', alloc._id);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
