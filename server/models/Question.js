import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [
    {
      label: {
        type: String, // A, B, C, D
        required: true,
        enum: ['A', 'B', 'C', 'D']
      },
      text: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  correctAnswer: {
    type: String, // A, B, C, D
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  order: {
    type: Number,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
