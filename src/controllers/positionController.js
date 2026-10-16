
const mongoose = require('mongoose')
const Position = require('../models/Position')
const Election = require('../models/Election')

// handles creation of a position
const createPosition = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { title, description, maxCandidates } = req.body

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID'
      })
    }

    // check that the position title is provided
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Position title is required'
      })
    }

    const election = await Election.findById(electionId)

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      })
    }

    // check that the election has not started or is not marked as completed
    if (!['DRAFT', 'UPCOMING'].includes(election.status)) {
      return res.status(400).json({
        success: false,
        message: 'Positions can only be created for draft or upcoming elections'
      })
    }

    // validate maxCandidates value when provided
    if (maxCandidates !== undefined && maxCandidates !== null) {
      if (
        !Number.isInteger(maxCandidates) || maxCandidates < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Maximum candidates must be a positive integer'
        })
      }
    }

    const position = await Position.create({
      title,
      description,
      election: electionId,
      maxCandidates
    })

    return res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create position',
      error: error.message
    })
  }
}

// handles retrieval of all positions belonging to an election
const getElectionPositions = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID'
      })
    }

    const election = await Election.findById(electionId)

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      })
    }

    const positions = await Position.find({ election: electionId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: positions.length,
      data: positions
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve positions',
      error: error.message
    })
  }
};

// handles retrieval of a single position
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      })
    }

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: position
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve position',
      error: error.message
    })
  }
}

// handles updating a position
const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, maxCandidates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      })
    }

    // check that at least one field is provided
    if ( title === undefined && description === undefined && maxCandidates === undefined){
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update'
      })
    }

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      })
    }

    // retrieve the election the position belongs to
    const election = await Election.findById(position.election);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      })
    }

    // prevent structural changes after the election starts
    if (!['DRAFT', 'UPCOMING'].includes(election.status)) {
      return res.status(400).json({
        success: false,
        message: 'Positions can only be updated before the election starts'
      })
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Position title must be a non-empty string'
        })
      }

      position.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Description must be a string'
        })
      }

      position.description = description.trim();
    }

    if (maxCandidates !== undefined) {
      if (
        maxCandidates !== null && (!Number.isInteger(maxCandidates) || maxCandidates < 1)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Maximum candidates must be a positive integer or null'
        })
      }

      position.maxCandidates = maxCandidates
    }

    await position.save()

    return res.status(200).json({
      success: true,
      message: 'Position updated successfully',
      data: position
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update position',
      error: error.message
    })
  }
}


// handles deletion of a position
const deletePosition = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position ID'
      })
    }

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      })
    }

    const election = await Election.findById(position.election);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      })
    }

    // prevent deletion after the election starts
    if (!['DRAFT', 'UPCOMING'].includes(election.status)) {
      return res.status(400).json({
        success: false,
        message: 'Positions can only be deleted before the election starts'
      })
    }

    await Position.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Position deleted successfully'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete position',
      error: error.message
    })
  }
}

module.exports = { createPosition, getElectionPositions, getPositionById, 
                   updatePosition, deletePosition }
