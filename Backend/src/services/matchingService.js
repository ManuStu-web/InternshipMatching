
// ============================================================
// SKILL SCORE (Semantic & Keyword Matching)
// ============================================================

const SKILL_ALIASES = {
  "react": ["react", "react.js", "reactjs", "frontend", "web"],
  "node.js": ["node.js", "nodejs", "node", "backend", "express", "express.js"],
  "python": ["python", "django", "flask", "fastapi", "pandas", "numpy"],
  "machine learning": ["machine learning", "ml", "ai", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn"],
  "tensorflow": ["tensorflow", "pytorch", "deep learning", "machine learning", "ai"],
  "cybersecurity": ["cybersecurity", "security", "infosec", "network security", "ethical hacking", "penetration testing"],
  "blockchain": ["blockchain", "solidity", "web3", "smart contracts", "crypto", "cryptography"],
  "docker": ["docker", "kubernetes", "containers", "devops", "ci/cd"],
  "kubernetes": ["kubernetes", "docker", "cloud", "devops"],
  "aws": ["aws", "cloud", "cloud computing", "azure", "gcp"],
  "sql": ["sql", "mysql", "postgresql", "database", "mongodb", "nosql"],
  "figma": ["figma", "ui/ux", "adobe xd", "design", "prototyping", "wireframing"],
  "embedded systems": ["embedded systems", "microcontrollers", "arduino", "vhdl", "verilog", "c", "c++", "iot"],
  "renewable energy": ["renewable energy", "solar", "wind", "energy", "sustainability", "power systems"],
  "flutter": ["flutter", "dart", "mobile", "mobile development", "android", "ios"]
};

const calculateSkillScore = (candidateSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 100;
  }

  if (!candidateSkills || candidateSkills.length === 0) {
    return 0;
  }

  const normalizedCandidateSkills = candidateSkills.map((s) => s.toLowerCase().trim());
  let matchedSkillsCount = 0;

  requiredSkills.forEach((reqSkill) => {
    const normReq = reqSkill.toLowerCase().trim();
    
    // Direct exact match
    if (normalizedCandidateSkills.includes(normReq)) {
      matchedSkillsCount += 1.0;
      return;
    }

    // Semantic alias matching
    const aliases = SKILL_ALIASES[normReq] || [normReq];
    const hasAliasMatch = normalizedCandidateSkills.some((candSkill) =>
      aliases.some((alias) => candSkill.includes(alias) || alias.includes(candSkill))
    );

    if (hasAliasMatch) {
      matchedSkillsCount += 0.85; // 85% partial credit for related skill
    }
  });

  return Math.min(100, Number(((matchedSkillsCount / requiredSkills.length) * 100).toFixed(1)));
};

// ============================================================
// ELIGIBILITY SCORE
// ============================================================

const calculateEligibilityScore = (candidate, internship) => {
  if (candidate.eligibility === false) {
    return 0;
  }

  const criteria = internship.eligibilityCriteria;
  if (!criteria) {
    return 100;
  }

  const candidateDegree = candidate.education?.degree?.toLowerCase().trim() || "";
  const candidateBranch = candidate.education?.branch?.toLowerCase().trim() || "";
  const candidateGraduationYear = candidate.education?.graduationYear;

  if (criteria.degrees && criteria.degrees.length > 0) {
    const allowedDegrees = criteria.degrees.map((d) => d.toLowerCase().trim());
    if (!allowedDegrees.some((d) => candidateDegree.includes(d) || d.includes(candidateDegree))) {
      return 0;
    }
  }

  if (criteria.branches && criteria.branches.length > 0) {
    const allowedBranches = criteria.branches.map((b) => b.toLowerCase().trim());
    if (!allowedBranches.some((b) => candidateBranch.includes(b) || b.includes(candidateBranch))) {
      return 0;
    }
  }

  if (criteria.minGraduationYear !== null && criteria.minGraduationYear !== undefined) {
    if (!candidateGraduationYear || candidateGraduationYear < criteria.minGraduationYear) {
      return 0;
    }
  }

  return 100;
};

// ============================================================
// ROLE SCORE
// ============================================================

const roleGroups = {
  software: ["software engineer", "software developer", "sde", "full stack", "fullstack"],
  frontend: ["frontend", "react developer", "ui developer", "web developer"],
  backend: ["backend", "node.js developer", "api developer", "server-side"],
  data: ["data analyst", "data scientist", "data engineer", "analytics"],
  ml: ["machine learning", "ml engineer", "ai engineer", "deep learning researcher"],
  security: ["cybersecurity", "security analyst", "soc analyst", "penetration tester"],
  design: ["designer", "ui/ux", "product designer", "interaction designer"],
  devops: ["devops", "cloud architect", "site reliability", "infrastructure"],
  blockchain: ["blockchain", "web3 engineer", "smart contract developer"],
  hardware: ["hardware engineer", "embedded systems", "vlsi", "electronics engineer"],
  energy: ["energy analyst", "renewable energy researcher", "power engineer"],
  mobile: ["mobile developer", "flutter developer", "android developer", "ios developer"]
};

const calculateRoleScore = (candidateRoles, internshipRole) => {
  if (!candidateRoles || candidateRoles.length === 0 || !internshipRole) {
    return 0;
  }

  const normalizedRoles = candidateRoles.map((role) => role.toLowerCase().trim());
  const normalizedInternshipRole = internshipRole.toLowerCase().trim();

  // Exact substring check
  if (normalizedRoles.some((role) => normalizedInternshipRole.includes(role) || role.includes(normalizedInternshipRole))) {
    return 100;
  }

  // Check role group clusters
  for (const group of Object.values(roleGroups)) {
    const candidateMatches = normalizedRoles.some((role) =>
      group.some((groupRole) => role.includes(groupRole) || groupRole.includes(role))
    );

    const internshipMatches = group.some(
      (groupRole) => normalizedInternshipRole.includes(groupRole) || groupRole.includes(normalizedInternshipRole)
    );

    if (candidateMatches && internshipMatches) {
      return 100;
    }
  }

  return 0;
};

// ============================================================
// LOCATION SCORE
// ============================================================

const calculateLocationScore = (preferredLocations, internshipLocation) => {
  if (!preferredLocations || preferredLocations.length === 0 || !internshipLocation) {
    return 0;
  }

  const normalizedLocations = preferredLocations.map((loc) => loc.toLowerCase().trim());
  const normalizedInternshipLoc = internshipLocation.toLowerCase().trim();

  if (normalizedLocations.some((loc) => loc.includes(normalizedInternshipLoc) || normalizedInternshipLoc.includes(loc))) {
    return 100;
  }

  // Partial match if candidate is willing to relocate or in same state
  return 20;
};

// ============================================================
// SECTOR SCORE
// ============================================================

const calculateSectorScore = (candidateSectors, internshipSector) => {
  if (!candidateSectors || candidateSectors.length === 0 || !internshipSector) {
    return 0;
  }

  const normalizedSectors = candidateSectors.map((sec) => sec.toLowerCase().trim());
  const normalizedInternshipSector = internshipSector.toLowerCase().trim();

  if (normalizedSectors.some((sec) => sec.includes(normalizedInternshipSector) || normalizedInternshipSector.includes(sec))) {
    return 100;
  }

  return 0;
};

// ============================================================
// EXPERIENCE SCORE
// ============================================================

const calculateExperienceScore = (candidateExperience, requiredExperience) => {
  if (requiredExperience === undefined || requiredExperience === null || requiredExperience <= 0) {
    return 100;
  }

  if (candidateExperience === undefined || candidateExperience === null) {
    return 0;
  }

  if (candidateExperience >= requiredExperience) {
    return 100;
  }

  return Math.min((candidateExperience / requiredExperience) * 100, 100);
};

// ============================================================
// AFFIRMATIVE ACTION & INCLUSIVITY SCORE (MoCA Mandate)
// ============================================================

const calculateAffirmativeScore = (candidate) => {
  let score = 0;

  // 1. NITI Aayog Aspirational District (+35 points)
  if (candidate.isAspirationalDistrict === true) {
    score += 35;
  }

  // 2. Rural Background (+25 points) / Semi-Urban (+10 points)
  if (candidate.areaType === "Rural") {
    score += 25;
  } else if (candidate.areaType === "Semi-Urban") {
    score += 10;
  }

  // 3. Social Category Inclusion (+25 points for SC/ST, +15 for OBC/EWS)
  const category = candidate.socialCategory || "General";
  if (category === "SC" || category === "ST") {
    score += 25;
  } else if (category === "OBC" || category === "EWS") {
    score += 15;
  }

  // 4. Gender Diversity / Women in Tech (+15 points)
  if (candidate.gender === "Female" || candidate.gender === "Other") {
    score += 15;
  }

  // 5. First Generation College Graduate (+10 points)
  if (candidate.firstGenerationLearner === true) {
    score += 10;
  }

  return Math.min(100, score);
};

// ============================================================
// CANDIDATE PREFERENCE SCORE
// ============================================================

const calculatePreferenceScore = (candidate, internship) => {
  if (!candidate.preferences || candidate.preferences.length === 0) {
    return 30; // Neutral baseline
  }

  const internshipId = internship._id ? internship._id.toString() : "";
  const preferenceIndex = candidate.preferences.findIndex((pref) => {
    const prefId = pref._id ? pref._id.toString() : pref.toString();
    return prefId === internshipId;
  });

  if (preferenceIndex === 0) return 100; // 1st Choice
  if (preferenceIndex === 1) return 80;  // 2nd Choice
  if (preferenceIndex === 2) return 60;  // 3rd Choice
  if (preferenceIndex > 2) return 40;   // 4th/5th Choice

  return 20; // Not in top ranked choices
};

// ============================================================
// COMPLETE WEIGHTED MATCH SCORE & EXPLAINABLE AI (XAI)
// ============================================================

const calculateMatchScore = (candidate, internship, customWeights = {}) => {
  // Configurable Weights with defaults
  const weights = {
    skills: customWeights.skills !== undefined ? customWeights.skills : 0.30,
    eligibility: customWeights.eligibility !== undefined ? customWeights.eligibility : 0.15,
    role: customWeights.role !== undefined ? customWeights.role : 0.15,
    location: customWeights.location !== undefined ? customWeights.location : 0.10,
    affirmative: customWeights.affirmative !== undefined ? customWeights.affirmative : 0.15,
    preference: customWeights.preference !== undefined ? customWeights.preference : 0.10,
    experience: customWeights.experience !== undefined ? customWeights.experience : 0.05,
  };

  const skillScore = calculateSkillScore(candidate.skills, internship.requiredSkills);
  const eligibilityScore = calculateEligibilityScore(candidate, internship);
  const roleScore = calculateRoleScore(candidate.preferredRoles, internship.role);
  const locationScore = calculateLocationScore(candidate.preferredLocations, internship.location);
  const sectorScore = calculateSectorScore(candidate.preferredSectors, internship.sector);
  const experienceScore = calculateExperienceScore(candidate.experience, internship.requiredExperience);
  const affirmativeScore = calculateAffirmativeScore(candidate);
  const preferenceScore = calculatePreferenceScore(candidate, internship);

  // If hard-ineligible, overall score is 0
  if (eligibilityScore === 0) {
    return {
      totalScore: 0,
      breakdown: {
        skills: 0,
        eligibility: 0,
        role: 0,
        location: 0,
        sector: 0,
        experience: 0,
        affirmative: 0,
        preference: 0,
      },
      reasonSummary: "Did not meet mandatory degree/branch eligibility criteria.",
    };
  }

  let totalWeightedScore =
    skillScore * weights.skills +
    eligibilityScore * weights.eligibility +
    roleScore * weights.role +
    locationScore * weights.location +
    affirmativeScore * weights.affirmative +
    preferenceScore * weights.preference +
    experienceScore * weights.experience;

  // Past Beneficiary Priority Filter:
  // If candidate was already allocated an internship previously, prioritize fresh candidates
  if (candidate.pastBeneficiary === true) {
    totalWeightedScore *= 0.70; // 30% reduction to prioritize fresh students
  }

  totalWeightedScore = Math.min(100, Math.max(0, totalWeightedScore));

  // Generate Explainable AI (XAI) reason
  const reasons = [];
  if (skillScore >= 70) reasons.push(`Skill Fit (${skillScore.toFixed(0)}%)`);
  if (preferenceScore >= 80) reasons.push(`Top Choice Match`);
  if (candidate.isAspirationalDistrict) reasons.push(`Aspirational District (${candidate.district || "Priority"})`);
  if (candidate.areaType === "Rural") reasons.push(`Rural Representation`);
  if (candidate.gender === "Female") reasons.push(`Gender Diversity`);
  if (reasons.length === 0) reasons.push(`General Merit Score`);

  return {
    totalScore: Number(totalWeightedScore.toFixed(1)),
    breakdown: {
      skills: Number(skillScore.toFixed(1)),
      eligibility: Number(eligibilityScore.toFixed(1)),
      role: Number(roleScore.toFixed(1)),
      location: Number(locationScore.toFixed(1)),
      sector: Number(sectorScore.toFixed(1)),
      experience: Number(experienceScore.toFixed(1)),
      affirmative: Number(affirmativeScore.toFixed(1)),
      preference: Number(preferenceScore.toFixed(1)),
    },
    reasonSummary: reasons.join(" + "),
  };
};

// ============================================================
// SINGLE INTERNSHIP ALLOCATION (Backward-Compatible)
// ============================================================

const allocateSeats = (candidates, internship, customWeights = {}) => {
  const eligibleCandidates = candidates.filter(
    (c) => calculateEligibilityScore(c, internship) === 100
  );

  const scoredCandidates = eligibleCandidates.map((candidate) => {
    const match = calculateMatchScore(candidate, internship, customWeights);
    return {
      candidate,
      score: match.totalScore,
      breakdown: match.breakdown,
      reasonSummary: match.reasonSummary,
    };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  const availableSeats = internship.availableSeats ?? internship.totalSeats ?? 0;

  const allocations = scoredCandidates.map((entry, index) => {
    const isAllocated = index < availableSeats;
    return {
      candidateId: entry.candidate._id || entry.candidate.name,
      candidateName: entry.candidate.name,
      candidateCategory: entry.candidate.socialCategory || "General",
      isAspirationalDistrict: Boolean(entry.candidate.isAspirationalDistrict),
      district: entry.candidate.district || "",
      score: entry.score,
      breakdown: entry.breakdown,
      reasonSummary: entry.reasonSummary,
      status: isAllocated ? "ALLOCATED" : "WAITLIST",
    };
  });

  return {
    internshipId: internship._id || null,
    internshipTitle: internship.title || null,
    totalCandidates: candidates.length,
    eligibleCandidates: eligibleCandidates.length,
    availableSeats,
    allocatedSeats: Math.min(availableSeats, scoredCandidates.length),
    allocations,
  };
};

// ============================================================
// GLOBAL NATIONWIDE BATCH ALLOCATION ENGINE (Multi-to-Multi)
// ============================================================

const allocateAllNationwide = (candidates, internships, customWeights = {}) => {
  // Track remaining seats per internship
  const seatCapacities = {};
  internships.forEach((internship) => {
    seatCapacities[internship._id.toString()] = internship.availableSeats ?? internship.totalSeats ?? 0;
  });

  // Calculate all candidate-internship pair scores
  const candidateScores = [];

  candidates.forEach((candidate) => {
    internships.forEach((internship) => {
      const match = calculateMatchScore(candidate, internship, customWeights);
      if (match.totalScore > 0) {
        candidateScores.push({
          candidate,
          internship,
          score: match.totalScore,
          breakdown: match.breakdown,
          reasonSummary: match.reasonSummary,
        });
      }
    });
  });

  // Sort globally by highest match score first
  candidateScores.sort((a, b) => b.score - a.score);

  const allocatedCandidateIds = new Set();
  const allocationsByInternship = {};
  internships.forEach((i) => {
    allocationsByInternship[i._id.toString()] = [];
  });

  // First Pass: Allocate highest scoring pairs within capacity constraints
  for (const item of candidateScores) {
    const candId = item.candidate._id.toString();
    const intId = item.internship._id.toString();

    if (allocatedCandidateIds.has(candId)) {
      continue; // Candidate already received best possible allocation
    }

    if (seatCapacities[intId] > 0) {
      // Allocate seat
      seatCapacities[intId] -= 1;
      allocatedCandidateIds.add(candId);

      allocationsByInternship[intId].push({
        candidateId: item.candidate._id,
        candidateName: item.candidate.name,
        candidateEmail: item.candidate.email,
        candidateGender: item.candidate.gender || "Prefer not to say",
        candidateCategory: item.candidate.socialCategory || "General",
        areaType: item.candidate.areaType || "Urban",
        district: item.candidate.district || "",
        isAspirationalDistrict: Boolean(item.candidate.isAspirationalDistrict),
        internshipId: item.internship._id,
        internshipTitle: item.internship.title,
        organization: item.internship.organization,
        score: item.score,
        breakdown: item.breakdown,
        reasonSummary: item.reasonSummary,
        status: "ALLOCATED",
      });
    }
  }

  // Second Pass: Assign remaining candidates to waitlists of their eligible internships
  for (const item of candidateScores) {
    const candId = item.candidate._id.toString();
    const intId = item.internship._id.toString();

    if (!allocatedCandidateIds.has(candId)) {
      const existingWaitlist = allocationsByInternship[intId].filter((a) => a.status === "WAITLIST");
      if (existingWaitlist.length < 5) {
        allocationsByInternship[intId].push({
          candidateId: item.candidate._id,
          candidateName: item.candidate.name,
          candidateEmail: item.candidate.email,
          candidateGender: item.candidate.gender || "Prefer not to say",
          candidateCategory: item.candidate.socialCategory || "General",
          areaType: item.candidate.areaType || "Urban",
          district: item.candidate.district || "",
          isAspirationalDistrict: Boolean(item.candidate.isAspirationalDistrict),
          internshipId: item.internship._id,
          internshipTitle: item.internship.title,
          organization: item.internship.organization,
          score: item.score,
          breakdown: item.breakdown,
          reasonSummary: item.reasonSummary,
          status: "WAITLIST",
        });
      }
    }
  }

  // Flatten all allocations
  const allAllocations = [];
  Object.values(allocationsByInternship).forEach((list) => {
    allAllocations.push(...list);
  });

  // Calculate Inclusivity & Demographic Metrics
  const allocatedOnly = allAllocations.filter((a) => a.status === "ALLOCATED");
  const totalAllocated = allocatedOnly.length;

  const ruralCount = allocatedOnly.filter((a) => a.areaType === "Rural").length;
  const aspirationalCount = allocatedOnly.filter((a) => a.isAspirationalDistrict).length;
  const femaleCount = allocatedOnly.filter((a) => a.candidateGender === "Female").length;

  const categoryCounts = { General: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 };
  allocatedOnly.forEach((a) => {
    const cat = a.candidateCategory || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalSeats = internships.reduce((sum, i) => sum + (i.totalSeats || 0), 0);

  return {
    totalCandidates: candidates.length,
    totalInternships: internships.length,
    totalSeats,
    totalAllocated,
    fillRate: totalSeats > 0 ? Number(((totalAllocated / totalSeats) * 100).toFixed(1)) : 0,
    demographics: {
      ruralPercentage: totalAllocated > 0 ? Number(((ruralCount / totalAllocated) * 100).toFixed(1)) : 0,
      aspirationalPercentage: totalAllocated > 0 ? Number(((aspirationalCount / totalAllocated) * 100).toFixed(1)) : 0,
      femalePercentage: totalAllocated > 0 ? Number(((femaleCount / totalAllocated) * 100).toFixed(1)) : 0,
      categoryDistribution: categoryCounts,
      ruralCount,
      aspirationalCount,
      femaleCount,
    },
    allocations: allAllocations,
  };
};

module.exports = {
  calculateSkillScore,
  calculateEligibilityScore,
  calculateRoleScore,
  calculateLocationScore,
  calculateSectorScore,
  calculateExperienceScore,
  calculateAffirmativeScore,
  calculatePreferenceScore,
  calculateMatchScore,
  allocateSeats,
  allocateAllNationwide,
};
