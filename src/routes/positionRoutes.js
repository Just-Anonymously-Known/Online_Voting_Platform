
const express = require('express')
const router = express.Router()
const positionController = require('../controllers/positionController')
const { protect, authorize } = require('../middleware/authMiddleware')

router.post('/create-position/:electionId', protect, authorize("admin"), positionController.createPosition)
router.get('/:electionId/get-positions', positionController.getElectionPositions)
router.get('/get-position/:id', positionController.getPositionById)
router.patch('/update-position/:id', protect, authorize("admin"), positionController.updatePosition)
router.delete('/delete-position/:id', protect, authorize("admin"), positionController.deletePosition)

module.exports = router
