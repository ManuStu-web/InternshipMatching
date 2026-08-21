
const Candidate = require("../models/Candidate");
const Internship = require("../models/Internship");
const Allocation = require("../models/Allocation");

const { allocateSeats } = require("../services/matchingService");

const runAllocation = async (req, res) => {
  try {
    const { internshipId } = req.params;

    // 1. Find internship
    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
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

    // 3. Store their candidate IDs
    const alreadyAllocatedCandidateIds = new Set(
      existingAllocations.map(
        (allocation) =>
          allocation.candidate.toString()
      )
    );

    // 4. Get all candidates
    const allCandidates = await Candidate.find();

    // 5. Remove candidates who already received
    // another internship
    const candidates = allCandidates.filter(
      (candidate) =>
        !alreadyAllocatedCandidateIds.has(
          candidate._id.toString()
        )
    );

    // 6. If no candidates remain
    if (candidates.length === 0) {
      return res.status(404).json({
        message: "No candidates available for allocation",
        alreadyAllocatedCandidates:
          existingAllocations.length,
      });
    }

    // 7. Run matching and allocation
    const result = allocateSeats(candidates, {
      ...internship.toObject(),
      availableSeats: allocationCapacity,
    });

    // 8. Delete previous results for THIS internship
    await Allocation.deleteMany({
      internship: internship._id,
    });

    // 9. Convert results into MongoDB documents
    const allocationDocuments =
      result.allocations.map(
        (allocation) => ({
          candidate: allocation.candidateId,
          internship: internship._id,
          score: allocation.score,
          breakdown: allocation.breakdown,
          status: allocation.status,
        })
      );

    // 10. Save allocation results
    if (allocationDocuments.length > 0) {
      await Allocation.insertMany(
        allocationDocuments
      );
    }

    await Internship.updateOne(
      { _id: internship._id },
      { $set: { availableSeats: allocationCapacity - result.allocatedSeats } },
    );

    // 11. Send result
    res.status(200).json({
      message:
        "Allocation completed successfully",

      result: {
        ...result,

        alreadyAllocatedCandidates:
          existingAllocations.length,
      },
    });

  } catch (error) {

    console.error(
      "Allocation error:",
      error
    );

    res.status(500).json({
      message: "Allocation failed",
      error: error.message,
    });
  }
};


const getAllocationResults = async (req, res) => {
  try {
    const { internshipId } = req.params;

    // Find allocation records
    const allocations = await Allocation.find({
      internship: internshipId,
    })

      // Candidate information
      .populate(
        "candidate",
        "name email phone skills education experience preferredLocations preferredRoles preferredSectors resumeUrl"
      )

      // Internship information
      .populate(
        "internship",
        "title availableSeats location role sector"
      )

      // Highest score first
      .sort({
        score: -1,
      });

    // No results
    if (allocations.length === 0) {
      return res.status(404).json({
        message:
          "No allocation results found",
      });
    }

    // Return results
    res.status(200).json({
      message:
        "Allocation results fetched successfully",

      count: allocations.length,

      allocations,
    });

  } catch (error) {

    console.error(
      "Get allocation results error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch allocation results",

      error: error.message,
    });
  }
};

module.exports = {
  runAllocation,
  getAllocationResults,
};

