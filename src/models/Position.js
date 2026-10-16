
const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true
    },

    description: {
      type: String,
      required: [ true, 'Position description is required'],
      trim: true,
    },

    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election reference is required']
    },

    maxCandidates: {
      type: Number,
      min: [1, 'Maximum candidates must be at least 1'],
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;
