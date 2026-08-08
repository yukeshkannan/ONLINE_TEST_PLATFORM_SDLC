import mongoose from 'mongoose';

const batchTrackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    uppercase: true,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['college', 'institute'],
    default: 'institute',
    trim: true
  },
  department: {
    type: String,
    default: 'All Departments',
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

batchTrackSchema.index({ category: 1, department: 1, name: 1 }, { unique: true });

const BatchTrack = mongoose.model('BatchTrack', batchTrackSchema);
export default BatchTrack;
