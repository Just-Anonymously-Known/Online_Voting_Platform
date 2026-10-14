const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Position = require('../models/Position');

const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

// POST /api/votes (voter only)
// The voter is taken from the verified token, never from the request body.
const castVote = async (req, res) => {
  try {
    const { election, position, candidate } = req.body;
    const voter = req.user._id;

    if (!election || !position || !candidate) {
      return res.status(400).json({ message: 'election, position and candidate are required' });
    }
    if (![election, position, candidate].every(isValidId)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ message: 'Your account is not active' });
    }

    const electionDoc = await Election.findById(election);
    if (!electionDoc) return res.status(404).json({ message: 'Election not found' });

    if (electionDoc.status !== 'active') {
      return res.status(400).json({ message: 'This election is not open for voting' });
    }

    const now = new Date();
    if (electionDoc.startDate && now < electionDoc.startDate) {
      return res.status(400).json({ message: 'Voting has not started yet' });
    }
    if (electionDoc.endDate && now > electionDoc.endDate) {
      return res.status(400).json({ message: 'Voting has ended' });
    }

    const positionDoc = await Position.findOne({ _id: position, election });
    if (!positionDoc) {
      return res.status(400).json({ message: 'Position does not belong to this election' });
    }

    const candidateDoc = await Candidate.findOne({
      _id: candidate,
      election,
      position,
      status: 'approved',
    });
    if (!candidateDoc) {
      return res.status(400).json({ message: 'Candidate is not an approved candidate for this position' });
    }

    // The unique index on { voter, election, position } is what stops a second
    // vote. It also covers two requests arriving at the same instant.
    const vote = await Vote.create({ voter, election, position, candidate });

    return res.status(201).json({
      message: 'Vote cast successfully',
      data: { _id: vote._id, election, position, votedAt: vote.votedAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already voted for this position in this election' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/votes/mine (voter only): the logged-in voter's own votes
const getMyVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user._id })
      .populate('election', 'title')
      .populate('position', 'title')
      .populate({ path: 'candidate', populate: { path: 'user', select: 'name' } })
      .sort({ votedAt: -1 });

    return res.status(200).json({ message: 'Your votes fetched successfully', data: votes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { castVote, getMyVotes };
