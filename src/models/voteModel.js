const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// A voter can vote once per position per election. The database itself
// blocks a second vote even if two requests land at the same instant.
voteSchema.index({ election: 1, position: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);