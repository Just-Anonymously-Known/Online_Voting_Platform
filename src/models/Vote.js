const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  votedAt: { type: Date, default: Date.now },
});

// One vote per voter, per position, per election. The database enforces this
// even if two requests arrive at the same moment.
voteSchema.index({ voter: 1, election: 1, position: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
