const express = require('express');
const router = express.Router();
const { getElectionResults } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

// Results endpoint accessible by any logged-in user role (Voter/Admin)
router.get('/:electionId/results', protect, getElectionResults);

module.exports = router;
