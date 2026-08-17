
const calculateSkillScore = (candidateSkills, requiredSkills) => {
  // If internship does not require any skills,
  // candidate gets full skill score.
  if (!requiredSkills || requiredSkills.length === 0) {
    return 100;
  }

  // If skills are required but candidate has none.
  if (!candidateSkills || candidateSkills.length === 0) {
    return 0;
  }

  // Convert candidate skills into a Set
  // for easier/faster matching.
  const candidateSkillSet = new Set(
    candidateSkills.map((skill) => skill.toLowerCase().trim()),
  );

  let matchedSkills = 0;

  requiredSkills.forEach((skill) => {
    if (candidateSkillSet.has(skill.toLowerCase().trim())) {
      matchedSkills++;
    }
  });

  return (matchedSkills / requiredSkills.length) * 100;
};


const calculateEligibilityScore = (candidate, internship) => {
  // Candidate is explicitly marked as ineligible
  if (candidate.eligibility === false) {
    return 0;
  }

  const criteria = internship.eligibilityCriteria;

  // No eligibility criteria
  if (!criteria) {
    return 100;
  }

  const candidateDegree =
    candidate.education?.degree?.toLowerCase().trim() || "";

  const candidateBranch =
    candidate.education?.branch?.toLowerCase().trim() || "";

  const candidateGraduationYear =
    candidate.education?.graduationYear;


  if (
    criteria.degrees &&
    criteria.degrees.length > 0
  ) {
    const allowedDegrees = criteria.degrees.map(
      degree => degree.toLowerCase().trim()
    );

    if (!allowedDegrees.includes(candidateDegree)) {
      return 0;
    }
  }

  if (
    criteria.branches &&
    criteria.branches.length > 0
  ) {
    const allowedBranches = criteria.branches.map(
      branch => branch.toLowerCase().trim()
    );

    if (!allowedBranches.includes(candidateBranch)) {
      return 0;
    }
  }
  if (
    criteria.minGraduationYear !== null &&
    criteria.minGraduationYear !== undefined
  ) {
    if (
      !candidateGraduationYear ||
      candidateGraduationYear < criteria.minGraduationYear
    ) {
      return 0;
    }
  }

  // All eligibility requirements passed
  return 100;
};

const calculateRoleScore = (candidateRoles, internshipRole) => {
  if (!candidateRoles || candidateRoles.length === 0) {
    return 0;
  }

  if (!internshipRole) {
    return 0;
  }

  // Similar roles are grouped together.
  const roleGroups = {
    software: [
      "software engineer",
      "software developer",
      "software development",
      "sde",
    ],

    frontend: [
      "frontend developer",
      "frontend engineer",
      "react developer",
      "ui developer",
    ],

    backend: [
      "backend developer",
      "backend engineer",
      "node.js developer",
      "server-side developer",
    ],

    fullstack: [
      "full stack developer",
      "fullstack developer",
      "full stack engineer",
    ],

    data: ["data analyst", "data scientist", "data engineer"],

    ml: ["machine learning engineer", "ml engineer", "ai engineer"],
  };

  const normalizedRoles = candidateRoles.map((role) =>
    role.toLowerCase().trim(),
  );

  const normalizedInternshipRole = internshipRole.toLowerCase().trim();

  // Check every role group.
  for (const group of Object.values(roleGroups)) {
    /*
            Example:

            Candidate:
            "React Developer"

            Internship:
            "Frontend Developer Intern"

            Both can belong to the frontend group.
        */

    const candidateMatches = normalizedRoles.some((role) =>
      group.some(
        (groupRole) => role.includes(groupRole) || groupRole.includes(role),
      ),
    );

    const internshipMatches = group.some(
      (groupRole) =>
        normalizedInternshipRole.includes(groupRole) ||
        groupRole.includes(normalizedInternshipRole),
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
  if (
    !preferredLocations ||
    preferredLocations.length === 0 ||
    !internshipLocation
  ) {
    return 0;
  }

  const normalizedLocations = preferredLocations.map((location) =>
    location.toLowerCase().trim(),
  );

  const normalizedInternshipLocation = internshipLocation.toLowerCase().trim();

  /*
        Exact location matching for now.

        Example:

        Candidate → Gurugram
        Internship → Gurugram

        Score → 100
    */

  if (normalizedLocations.includes(normalizedInternshipLocation)) {
    return 100;
  }

  return 0;
};

// ============================================================
// SECTOR SCORE
// ============================================================

const calculateSectorScore = (candidateSectors, internshipSector) => {
  if (!candidateSectors || candidateSectors.length === 0 || !internshipSector) {
    return 0;
  }

  const normalizedSectors = candidateSectors.map((sector) =>
    sector.toLowerCase().trim(),
  );

  const normalizedInternshipSector = internshipSector.toLowerCase().trim();

  if (normalizedSectors.includes(normalizedInternshipSector)) {
    return 100;
  }

  return 0;
};

// ============================================================
// EXPERIENCE SCORE
// ============================================================

const calculateExperienceScore = (candidateExperience, requiredExperience) => {
  /*
        If internship doesn't specify experience,
        everyone gets full score.
    */

  if (
    requiredExperience === undefined ||
    requiredExperience === null ||
    requiredExperience <= 0
  ) {
    return 100;
  }

  /*
        If candidate experience isn't available.
    */

  if (candidateExperience === undefined || candidateExperience === null) {
    return 0;
  }

  /*
        Candidate meets or exceeds requirement.
    */

  if (candidateExperience >= requiredExperience) {
    return 100;
  }

  /*
        Partial score.

        Example:

        Required = 2 years
        Candidate = 1 year

        Score = 50
    */

  return Math.min((candidateExperience / requiredExperience) * 100, 100);
};

// ============================================================
// COMPLETE MATCH SCORE
// ============================================================

const calculateMatchScore = (candidate, internship) => {
  // -------------------------
  // 1. Skills → 40%
  // -------------------------

  const skillScore = calculateSkillScore(
    candidate.skills,
    internship.requiredSkills,
  );

  // -------------------------
  // 2. Eligibility → 20%
  // -------------------------

  const eligibilityScore = calculateEligibilityScore(candidate, internship);

  // -------------------------
  // 3. Role → 15%
  // -------------------------

  const roleScore = calculateRoleScore(
    candidate.preferredRoles,
    internship.role,
  );

  // -------------------------
  // 4. Location → 10%
  // -------------------------

  const locationScore = calculateLocationScore(
    candidate.preferredLocations,
    internship.location,
  );

  // -------------------------
  // 5. Sector → 10%
  // -------------------------

  const sectorScore = calculateSectorScore(
    candidate.preferredSectors,
    internship.sector,
  );

  // -------------------------
  // 6. Experience → 5%
  // -------------------------

  const experienceScore = calculateExperienceScore(
    candidate.experience,
    internship.requiredExperience,
  );

  // ========================================================
  // FINAL WEIGHTED SCORE
  // ========================================================

  const totalScore =
    skillScore * 0.4 +
    eligibilityScore * 0.2 +
    roleScore * 0.15 +
    locationScore * 0.1 +
    sectorScore * 0.1 +
    experienceScore * 0.05;

  return {
    totalScore: Number(totalScore.toFixed(2)),

    breakdown: {
      skills: Number(skillScore.toFixed(2)),

      eligibility: Number(eligibilityScore.toFixed(2)),

      role: Number(roleScore.toFixed(2)),

      location: Number(locationScore.toFixed(2)),

      sector: Number(sectorScore.toFixed(2)),

      experience: Number(experienceScore.toFixed(2)),
    },
  };
};

// ============================================================
// RANK CANDIDATES
// ============================================================

const rankCandidates = (candidates, internship) => {
  const rankedCandidates = candidates.map((candidate) => {
    const matchResult = calculateMatchScore(candidate, internship);

    return {
      candidate,

      score: matchResult.totalScore,

      breakdown: matchResult.breakdown,
    };
  });

  // Highest score first.
  rankedCandidates.sort((a, b) => b.score - a.score);

  return rankedCandidates;
};

// ============================================================
// ALLOCATE SEATS
// ============================================================

const allocateSeats = (candidates, internship) => {

  // Only candidates who pass the actual
  // eligibility criteria can receive an internship
  const eligibleCandidates = candidates.filter(
    candidate =>
      calculateEligibilityScore(
        candidate,
        internship
      ) === 100
  );

  // Rank only eligible candidates
  const rankedCandidates = rankCandidates(
    eligibleCandidates,
    internship
  );

  const availableSeats =
    internship.availableSeats ??
    internship.totalSeats ??
    0;

  const allocations = rankedCandidates.map(
    (candidate, index) => {

      const allocated =
        index < availableSeats;

      return {
        candidateId:
          candidate.candidate._id ||
          candidate.candidate.name,

        candidateName:
          candidate.candidate.name,

        score: candidate.score,

        breakdown:
          candidate.breakdown,

        status:
          allocated
            ? "ALLOCATED"
            : "WAITLIST"
      };
    }
  );

  return {
    internshipId:
      internship._id || null,

    internshipTitle:
      internship.title || null,

    totalCandidates:
      candidates.length,

    eligibleCandidates:
      eligibleCandidates.length,

    availableSeats,

    allocatedSeats:
      Math.min(
        availableSeats,
        rankedCandidates.length
      ),

    allocations
  };
};


module.exports = {
  calculateSkillScore,

  calculateEligibilityScore,

  calculateRoleScore,

  calculateLocationScore,

  calculateSectorScore,

  calculateExperienceScore,

  calculateMatchScore,

  rankCandidates,

  allocateSeats,
};
