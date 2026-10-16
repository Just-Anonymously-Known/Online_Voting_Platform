const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Position = require('../models/Position');
const User = require('../models/User');

const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

// POST /api/candidates (admin only)
const createCandidate = async (req, res) => {
  try {
    const { user, election, position, manifesto } = req.body;

    if (!user || !election || !position) {
      return res.status(400).json({ message: 'user, election and position are required' });
    }
    if (![user, election, position].every(isValidId)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const electionDoc = await Election.findById(election);
    if (!electionDoc) return res.status(404).json({ message: 'Election not found' });

    const positionDoc = await Position.findOne({ _id: position, election });
    if (!positionDoc) {
      return res.status(400).json({ message: 'Position does not belong to this election' });
    }

    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    if (positionDoc.maxCandidates) {
      const count = await Candidate.countDocuments({ election, position });
      if (count >= positionDoc.maxCandidates) {
        return res.status(400).json({ message: 'This position already has the maximum number of candidates' });
      }
    }

    const candidate = await Candidate.create({ user, election, position, manifesto });

    return res.status(201).json({ message: 'Candidate added successfully', data: candidate });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This user is already a candidate for this position' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/candidates?election=...&position=...&status=...
// Admins see every candidate. Everyone else only sees approved candidates.
const getCandidates = async (req, res) => {
  try {
    const { election, position, status } = req.query;

    if ((election && !isValidId(election)) || (position && !isValidId(position))) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const filter = {};
    if (election) filter.election = election;
    if (position) filter.position = position;

    if (req.user.role === 'admin') {
      if (status) filter.status = status;
    } else {
      filter.status = 'approved';
    }

    const candidates = await Candidate.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: 'Candidates fetched successfully', data: candidates });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const candidate = await Candidate.findById(req.params.id).populate('user', 'name');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role !== 'admin' && candidate.status !== 'approved') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    return res.status(200).json({ message: 'Candidate fetched successfully', data: candidate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/candidates/:id (admin only)
// Only the manifesto and status can change. The user, election and position
// of a candidate are fixed once created.
const updateCandidate = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const updates = {};
    if (req.body.manifesto !== undefined) updates.manifesto = req.body.manifesto;
    if (req.body.status !== undefined) updates.status = req.body.status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Provide manifesto or status to update' });
    }

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    return res.status(200).json({ message: 'Candidate updated successfully', data: candidate });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createCandidate, getCandidates, getCandidateById, updateCandidate };
