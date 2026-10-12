const Vote = require('../models/voteModel');
const Candidate = require('../models/candidateModel');
const Election = require('../models/electionModel');
const Position = require('../models/positionModel');

// POST /api/votes (voter only)
const castVote = async (req, res) => {
  try {
    const { election, position, candidate } = req.body;
    const voter = req.user._id;

    if (!election || !position || !candidate) {
      return res.status(400).json({ message: 'election, position and candidate are required' });
    }

    const electionDoc = await Election.findById(election);
    if (!electionDoc) return res.status(404).json({ message: 'Election not found' });

    if (electionDoc.status !== 'ongoing') {
      return res.status(400).json({ message: 'This election is not currently open for voting' });
    }

    const now = new Date();
    if (electionDoc.startDate && now < electionDoc.startDate) {
      return res.status(400).json({ message: 'Voting has not started yet' });
    }
    if (electionDoc.endDate && now > electionDoc.endDate) {
      return res.status(400).json({ message: 'Voting has closed' });
    }

    const positionDoc = await Position.findOne({ _id: position, election });
    if (!positionDoc) {
      return res.status(400).json({ message: 'Position does not belong to this election' });
    }

    const candidateDoc = await Candidate.findOne({ _id: candidate, election, position });
    if (!candidateDoc) {
      return res.status(400).json({ message: 'Candidate does not belong to this position' });
    }

    const alreadyVoted = await Vote.findOne({ election, position, voter });
    if (alreadyVoted) {
      return res.status(409).json({ message: 'You have already voted for this position' });
    }

    let vote;
    try {
      vote = await Vote.create({ election, position, candidate, voter });
    } catch (error) {
      // Backup guard: the unique index catches a duplicate even if two
      // requests slipped past the findOne check at the same instant.
      if (error.code === 11000) {
        return res.status(409).json({ message: 'You have already voted for this position' });
      }
      throw error;
    }

    candidateDoc.voteCount += 1;
    await candidateDoc.save();

    return res.status(201).json({ message: 'Vote cast successfully', data: vote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/votes/my-votes (voter only, shows what they already voted for)
const getMyVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user._id }).populate('candidate', 'name');
    return res.status(200).json({ message: 'Your votes fetched successfully', data: votes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { castVote, getMyVotes };