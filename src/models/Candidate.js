const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    manifesto: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One user can contest a given position in a given election only once.
candidateSchema.index({ user: 1, election: 1, position: 1 }, { unique: true });
candidateSchema.index({ election: 1, position: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
