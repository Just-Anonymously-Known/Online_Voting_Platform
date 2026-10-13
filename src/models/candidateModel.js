const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    name: { type: String, required: true, trim: true },
    manifesto: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    voteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

candidateSchema.index({ election: 1, position: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);