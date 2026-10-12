const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.put('/:id', protect, authorize('admin'), updateCandidate);
router.delete('/:id', protect, authorize('admin'), deleteCandidate);

module.exports = router;