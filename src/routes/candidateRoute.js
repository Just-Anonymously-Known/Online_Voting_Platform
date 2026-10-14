const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createCandidate);
router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);
router.patch('/:id', protect, authorize('admin'), updateCandidate);

module.exports = router;
