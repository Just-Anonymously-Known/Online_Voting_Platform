const mongoose = require("mongoose");
const Election = require("../models/Election");
const { Admin } = require("../middleware/authMiddleware");

// CREATE ELECTIONS
const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, start date and end date are required",
      });
    }
    const parseDate = (value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Invalid election date",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date",
      });
    }

    if (status !== undefined && !["DRAFT", "UPCOMING"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "New elections can only be created as DRAFT or UPCOMING",
      });
    }

    const election = await Election.create({
      title,
      description,
      startDate: start,
      endDate: end,
      status: status || "DRAFT",
      createdBy: req.user.id,
    });
    return res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election,
    });
  } catch (error) {
    console.error("Create election error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create election",
    });
  }
};

//GET ALL ELECTIONS
const getElections = async (req, res) => {
  try {
    const getAllElections = await Election.find();
    return res.status(200).json({
      success: true,
      count: Election.length,
      data: getAllElections,
      message: "elections retrieved succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve elections",
    });
  }
};

// GET SINGLE ELECTION
const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid election ID" });
    }

    const getSingleElection = await Election.findById(id).lean();

    if (!Election) {
      return res
        .status(404)
        .json({ message: "Election not found", data: Election });
    }

    return res.status(200).json({
      success: true,
      data: getSingleElection,
    });
  } catch (error) {
    console.error("Create election error:", error);
    res.status(500).json({ message: "Failed to retrieve election" });
  }
};

// UPDATE ELECTION(BY _ID)
const updates = {};

const updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const update = await Election.findByIdAndUpdate(
      id,
      { title, description, startDate, endDate },
      { new: true },
    );

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid election ID",
      });
    }

    return res
      .status(200)
      .json({ message: "Election updated successfully", data: update });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE ELECTION(BY STATUS)
const updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const election = await Election.findById(id);

    const allowedUpdates = {
      DRAFT: ["UPCOMING", "CANCELLED"],
      UPCOMING: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowedUpdates[election.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${election.status} to ${status}`,
      });
    }
    election.status = status;
    await election.save();

    return res.status(200).json({
      success: true,
      message: "Election status updated successfully",
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update election status",
    });
  }
};

//DELETE ELECTION
const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }
    //completed elections can't be deleted
    if (["ACTIVE", "COMPLETED"].includes(election.status)) {
      return res.status(400).json({
        success: false,
        message: "Active or completed elections cannot be deleted",
      });
    }
    await election.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Election deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete election",
    });
  }
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  updateElectionStatus,
  deleteElection,
};
