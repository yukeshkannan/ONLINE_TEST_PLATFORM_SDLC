import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'N/A',
    trim: true
  },
  courseTrack: {
    type: String,
    default: 'N/A',
    trim: true
  },
  categoryMode: {
    type: String,
    enum: ['college', 'institute'],
    default: 'college'
  },
  role: {
    type: String,
    default: 'trainer'
  },
  resetOTP: {
    type: String,
    default: null
  },
  resetOTPExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
