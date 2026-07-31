import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  studentType: {
    type: String,
    enum: ['college', 'institute'],
    default: 'college'
  },
  enrollmentId: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true
  },
  courseTrack: {
    type: String,
    trim: true,
    default: ''
  },
  batchTime: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

studentSchema.index({ department: 1, batch: 1, year: 1 });
studentSchema.index({ studentType: 1, courseTrack: 1 });
studentSchema.index({ enrollmentId: 1 }, { sparse: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;

