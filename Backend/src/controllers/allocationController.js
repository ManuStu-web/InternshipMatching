
const Candidate = require("../models/Candidate");
const Internship = require("../models/Internship");
const Allocation = require("../models/Allocation");

const { allocateSeats, allocateAllNationwide } = require("../services/matchingService");

// ============================================================
// SINGLE INTERNSHIP ALLOCATION
// ============================================================
const runAllocation = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { weights } = req.body; // Optional customizable policy weights

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const currentAllocations = await Allocation.find({
      internship: internship._id,
      status: "ALLOCATED",
    }).select("candidate");

    // Restore the capacity consumed by this internship's current results
    // before recalculating, so rerunning allocation does not lose seats.
    const allocationCapacity = internship.availableSeats + currentAllocations.length;

    // 2. Find candidates who are already
    // allocated to ANOTHER internship
    const existingAllocations = await Allocation.find({
      status: "ALLOCATED",
      internship: { $ne: internship._id },
    }).select("candidate");

    const alreadyAllocatedCandidateIds = new Set(
      existingAllocations.map((a) => a.candidate.toString())
    );

    const allCandidates = await Candidate.find();
    const candidates = allCandidates.filter(
      (c) => !alreadyAllocatedCandidateIds.has(c._id.toString())
    );

    if (candidates.length === 0) {
      return res.status(404).json({
        message: "No candidates available for allocation",
        alreadyAllocatedCandidates: existingAllocations.length,
      });
    }

    // 7. Run matching and allocation
    const result = allocateSeats(candidates, {
      ...internship.toObject(),
      availableSeats: allocationCapacity,
    });

    // Clear previous results for this internship
    await Allocation.deleteMany({ internship: internship._id });

    const allocationDocuments = result.allocations.map((alloc) => ({
      candidate: alloc.candidateId,
      internship: internship._id,
      score: alloc.score,
      breakdown: alloc.breakdown,
      reasonSummary: alloc.reasonSummary,
      status: alloc.status,
    }));

    if (allocationDocuments.length > 0) {
      await Allocation.insertMany(allocationDocuments);
    }

    await Internship.updateOne(
      { _id: internship._id },
      { $set: { availableSeats: allocationCapacity - result.allocatedSeats } },
    );

    // 11. Send result
    res.status(200).json({
      message: "Single internship allocation completed successfully",
      result: {
        ...result,
        alreadyAllocatedCandidates: existingAllocations.length,
      },
    });
  } catch (error) {
    console.error("Allocation error:", error);
    res.status(500).json({ message: "Allocation failed", error: error.message });
  }
};

// ============================================================
// GLOBAL NATIONWIDE BATCH ALLOCATION
// ============================================================
const runGlobalAllocation = async (req, res) => {
  try {
    const { weights } = req.body; // e.g. { skills: 0.35, affirmative: 0.20, ... }

    const candidates = await Candidate.find();
    const internships = await Internship.find({ status: { $ne: "closed" } });

    if (candidates.length === 0 || internships.length === 0) {
      return res.status(400).json({
        message: "Insufficient data: Candidates and Open Internships are required to run allocation.",
      });
    }

    // Run modern global capacity-constrained match engine
    const matchResult = allocateAllNationwide(candidates, internships, weights || {});

    // Clear all existing allocations to establish clean nationwide round
    await Allocation.deleteMany({});

    // Save all generated allocations
    const allocationDocuments = matchResult.allocations.map((a) => ({
      candidate: a.candidateId,
      internship: a.internshipId,
      score: a.score,
      breakdown: a.breakdown,
      reasonSummary: a.reasonSummary,
      status: a.status,
    }));

    if (allocationDocuments.length > 0) {
      await Allocation.insertMany(allocationDocuments);
    }

    res.status(200).json({
      message: "Nationwide Smart Allocation Engine completed successfully",
      result: matchResult,
    });
  } catch (error) {
    console.error("Global allocation error:", error);
    res.status(500).json({ message: "Global allocation failed", error: error.message });
  }
};

// ============================================================
// GET ALLOCATIONS FOR A SPECIFIC INTERNSHIP
// ============================================================
const getAllocationResults = async (req, res) => {
  try {
    const { internshipId } = req.params;

    const allocations = await Allocation.find({ internship: internshipId })
      .populate("candidate")
      .populate("internship", "title availableSeats totalSeats location role sector organization")
      .sort({ score: -1 });

    if (allocations.length === 0) {
      return res.status(404).json({ message: "No allocation results found" });
    }

    res.status(200).json({
      message: "Allocation results fetched successfully",
      count: allocations.length,
      allocations,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch allocation results", error: error.message });
  }
};

// ============================================================
// GET ALL GLOBAL ALLOCATIONS (For Overview / Admin Table)
// ============================================================
const getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate("candidate")
      .populate("internship", "title availableSeats totalSeats location role sector organization")
      .sort({ score: -1 });

    res.status(200).json({
      message: "All allocations fetched successfully",
      count: allocations.length,
      allocations,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch allocations", error: error.message });
  }
};

// ============================================================
// GET SCHEME INCLUSIVITY & DEMOGRAPHIC METRICS
// ============================================================
const getAllocationMetrics = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const internships = await Internship.find();
    const totalSeats = internships.reduce((sum, i) => sum + (i.totalSeats || 0), 0);

    const allocations = await Allocation.find({ status: "ALLOCATED" })
      .populate("candidate", "socialCategory gender areaType isAspirationalDistrict district");

    const totalAllocated = allocations.length;

    let ruralCount = 0;
    let aspirationalCount = 0;
    let femaleCount = 0;
    const categoryCounts = { General: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 };

    allocations.forEach((item) => {
      const c = item.candidate;
      if (c) {
        if (c.areaType === "Rural") ruralCount++;
        if (c.isAspirationalDistrict) aspirationalCount++;
        if (c.gender === "Female") femaleCount++;
        const cat = c.socialCategory || "General";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    res.status(200).json({
      metrics: {
        totalCandidates,
        totalInternships: internships.length,
        totalSeats,
        totalAllocated,
        fillRate: totalSeats > 0 ? Number(((totalAllocated / totalSeats) * 100).toFixed(1)) : 0,
        ruralCount,
        aspirationalCount,
        femaleCount,
        ruralPercentage: totalAllocated > 0 ? Number(((ruralCount / totalAllocated) * 100).toFixed(1)) : 0,
        aspirationalPercentage: totalAllocated > 0 ? Number(((aspirationalCount / totalAllocated) * 100).toFixed(1)) : 0,
        femalePercentage: totalAllocated > 0 ? Number(((femaleCount / totalAllocated) * 100).toFixed(1)) : 0,
        categoryDistribution: categoryCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to compute allocation metrics", error: error.message });
  }
};

// ============================================================
// ACCEPT / DECLINE OFFER & AUTO-PROMOTE WAITLIST
// ============================================================
const updateAllocationAcceptance = async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { status } = req.body; // "ACCEPTED" or "DECLINED"

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Status must be ACCEPTED or DECLINED" });
    }

    const allocation = await Allocation.findById(allocationId);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation record not found" });
    }

    allocation.acceptanceStatus = status;
    await allocation.save();

    let autoPromotedCandidate = null;

    // If candidate declined, promote next best waitlisted candidate for this internship
    if (status === "DECLINED" && allocation.status === "ALLOCATED") {
      allocation.status = "WAITLIST";
      await allocation.save();

      const nextWaitlist = await Allocation.findOne({
        internship: allocation.internship,
        status: "WAITLIST",
        acceptanceStatus: "PENDING",
      }).sort({ score: -1 });

      if (nextWaitlist) {
        nextWaitlist.status = "ALLOCATED";
        await nextWaitlist.save();
        autoPromotedCandidate = nextWaitlist.candidate;
      }
    }

    res.status(200).json({
      message: `Allocation offer marked as ${status}`,
      allocation,
      autoPromotedCandidate,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update allocation status", error: error.message });
  }
};

// ============================================================
// RESET / CLEAR ALL ALLOCATIONS (Unallocate All Candidates)
// ============================================================
const resetAllocations = async (req, res) => {
  try {
    const result = await Allocation.deleteMany({});
    res.status(200).json({
      message: "All allocations cleared successfully. All candidates are now unallocated.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset allocations", error: error.message });
  }
};

module.exports = {
  runAllocation,
  runGlobalAllocation,
  getAllocationResults,
  getAllAllocations,
  getAllocationMetrics,
  updateAllocationAcceptance,
  resetAllocations,
};


