const express = require('express');
const router = express.Router();
const { castVote, getMyVotes } = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('voter'), castVote);
router.get('/mine', protect, authorize('voter'), getMyVotes);

module.exports = router;
