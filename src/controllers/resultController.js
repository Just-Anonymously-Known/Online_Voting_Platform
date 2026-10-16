const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

/**
 * GET /api/elections/:electionId/results
 * Securely calculates and fetches election results by position
 */
const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    // 1. Gather all candidates competing in this specific election
    const candidates = await Candidate.find({ election: electionId })
      .select('name position voteCount')
      .lean();

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No results found or no candidates registered for this election'
      });
    }

    // 2. Group candidates dynamically by their positions
    const positionsMap = {};

    candidates.forEach(candidate => {
      const posId = candidate.position.toString();
      if (!positionsMap[posId]) {
        positionsMap[posId] = {
          positionId: posId,
          totalVotesCast: 0,
          candidates: [],
          winners: [],
          isTie: false
        };
      }
      
      positionsMap[posId].candidates.push({
        id: candidate._id,
        name: candidate.name,
        votes: candidate.voteCount || 0
      });
      
      positionsMap[posId].totalVotesCast += (candidate.voteCount || 0);
    });

    // 3. Process each position to determine winners and explicit ties
    const structuredResults = Object.values(positionsMap).map(posData => {
      // Sort candidates from highest votes to lowest
      posData.candidates.sort((a, b) => b.votes - a.votes);

      const maxVotes = posData.candidates[0].votes;

      // Filter to find who shares the top spot
      const topContenders = posData.candidates.filter(c => c.votes === maxVotes);

      if (maxVotes > 0) {
        posData.winners = topContenders.map(c => ({ id: c.id, name: c.name }));
        posData.isTie = topContenders.length > 1;
      } else {
        // Handle edge-case where no votes were cast at all
        posData.winners = [];
        posData.isTie = false;
      }

      return posData;
    });

    // 4. Perform an internal database integrity cross-check
    const systemVoteCount = await Vote.countDocuments({ election: electionId });
    const aggregatedCandidateVotes = structuredResults.reduce((sum, p) => sum + p.totalVotesCast, 0);

    return res.status(200).json({
      success: true,
      message: 'Election results processed successfully',
      meta: {
        electionId,
        integrityCheck: {
          totalVotesInStorage: systemVoteCount,
          totalVotesSummed: aggregatedCandidateVotes,
          isConsistent: systemVoteCount === aggregatedCandidateVotes
        }
      },
      results: structuredResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while compiling results',
      error: error.message
    });
  }
};

module.exports = {
  getElectionResults
};
