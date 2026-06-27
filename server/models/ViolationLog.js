import mongoose from 'mongoose';

const violationLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  violationType: {
    type: String,
    enum: ['tab_switch', 'fullscreen_exit', 'copy_attempt'],
    default: 'tab_switch'
  },
  // Total violation count for this student+test combo
  count: {
    type: Number,
    default: 1
  },
  // Timestamps of each individual violation event
  events: [
    {
      timestamp: { type: Date, default: Date.now },
      type: { type: String, default: 'tab_switch' }
    }
  ],
  // Was auto-submitted due to violations?
  autoSubmitted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// One document per student per test (upsert pattern)
violationLogSchema.index({ studentId: 1, testId: 1 }, { unique: true });

const ViolationLog = mongoose.model('ViolationLog', violationLogSchema);
export default ViolationLog;
