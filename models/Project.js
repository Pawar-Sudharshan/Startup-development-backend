import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
  },
  problemStatement: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  llmResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Project = mongoose.model('Project', projectSchema);
