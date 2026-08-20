const mongoose = require('mongoose');
const Candidate = require('../src/models/Candidate');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih25033';

function normalizeArrayField(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    // split any comma/semicolon-containing entries, trim, remove empties and duplicates
    const parts = value.flatMap(v => String(v).split(/[,;]+/)).map(s => s.trim()).filter(Boolean);
    return Array.from(new Set(parts));
  }
  if (typeof value === 'string') {
    const parts = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
    return Array.from(new Set(parts));
  }
  // other types: return empty array
  return [];
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function needsNormalization(original, normalized) {
  // If original is undefined/null and normalized is empty array, don't force-update — treat as no-op
  if ((original === undefined || original === null) && Array.isArray(normalized) && normalized.length === 0) return false;
  // If original is string and normalized is equal to [originalTrimmed] then we should update (string -> array)
  if (typeof original === 'string') return true;
  // If original is array, but differs from normalized (different items/order), update
  if (Array.isArray(original)) return !arraysEqual(original, normalized);
  // Other types (numbers, objects) — update to normalized
  return true;
}

async function run({ dryRun = false, limit = Infinity } = {}) {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  const cursor = Candidate.find().cursor();
  let changed = 0;
  let processed = 0;
  for await (const c of cursor) {
    if (processed >= limit) break;
    processed++;

    const newSkills = normalizeArrayField(c.skills);
    const newLocs = normalizeArrayField(c.preferredLocations);

    const skillNeeds = needsNormalization(c.skills, newSkills);
    const locNeeds = needsNormalization(c.preferredLocations, newLocs);

    if (skillNeeds || locNeeds) {
      console.log(`Candidate ${c._id} would be updated:`);
      if (skillNeeds) console.log(' - skills:', c.skills, '=>', newSkills);
      if (locNeeds) console.log(' - preferredLocations:', c.preferredLocations, '=>', newLocs);

      if (!dryRun) {
        c.skills = newSkills;
        c.preferredLocations = newLocs;
        await c.save();
        changed++;
        console.log('Saved candidate', c._id);
      } else {
        changed++;
      }
    }
  }

  console.log(`Processed ${processed} candidates. ${dryRun ? 'Would update' : 'Updated'} ${changed} candidate(s).`);
  await mongoose.disconnect();
}

// CLI handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
let limit = Infinity;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--limit' || args[i] === '-l') && args[i + 1]) {
    const n = parseInt(args[i + 1], 10);
    if (!Number.isNaN(n) && n > 0) limit = n;
  }
}

run({ dryRun, limit }).catch(err => { console.error(err); process.exit(1); });
