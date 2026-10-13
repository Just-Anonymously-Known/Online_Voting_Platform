const Candidate = require('../models/candidateModel');
const Election = require('../models/electionModel');
const Position = require('../models/positionModel');

// POST /api/candidates (admin only)
const createCandidate = async (req, res) => {
  try {
    const { election, position, name, manifesto, photoUrl } = req.body;

    if (!election || !position || !name) {
      return res.status(400).json({ message: 'election, position and name are required' });
    }

    const electionDoc = await Election.findById(election);
    if (!electionDoc) return res.status(404).json({ message: 'Election not found' });

    const positionDoc = await Position.findOne({ _id: position, election });
    if (!positionDoc) {
      return res.status(400).json({ message: 'Position does not belong to this election' });
    }

    const candidate = await Candidate.create({ election, position, name, manifesto, photoUrl });

    return res.status(201).json({ message: 'Candidate added successfully', data: candidate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/candidates?election=...&position=...
const getCandidates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.election) filter.election = req.query.election;
    if (req.query.position) filter.position = req.query.position;

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Candidates fetched successfully', data: candidates });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    return res.status(200).json({ message: 'Candidate fetched successfully', data: candidate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/candidates/:id (admin only)
const updateCandidate = async (req, res) => {
  try {
    const { name, manifesto, photoUrl } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { name, manifesto, photoUrl },
      { new: true, runValidators: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    return res.status(200).json({ message: 'Candidate updated successfully', data: candidate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/candidates/:id (admin only)
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    return res.status(200).json({ message: 'Candidate deleted successfully', data: candidate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
};