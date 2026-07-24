import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passMark: {
    type: Number,
    required: true
  },
  instructions: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  assignedTo: [
    {
      department: { type: String },
      batch: { type: String },
      year: { type: String }
    }
  ],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended'],
    default: 'draft'
  },
  showResultsToStudents: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast lookup during high concurrent exam requests
testSchema.index({ status: 1, startTime: -1 });
testSchema.index({ 'assignedTo.department': 1, 'assignedTo.batch': 1, 'assignedTo.year': 1 });

const Test = mongoose.model('Test', testSchema);
export default Test;

