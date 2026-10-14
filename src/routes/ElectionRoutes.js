const express = require("express");
const router = express.Router();
const electionController = require("../controllers/electionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  updateElectionStatus,
  deleteElection,
} = require("../controllers/electionController");

router.get("/", getElections);
router.get("/:id", getElectionById);

router.post("/new_election", protect, authorize("admin"), createElection);
router.patch("/:id", protect, authorize("admin"), updateElection);
router.patch("/:id/status", protect, authorize("admin"), updateElectionStatus);
router.delete("/:id", protect, authorize("admin"), deleteElection);
module.exports = router;
