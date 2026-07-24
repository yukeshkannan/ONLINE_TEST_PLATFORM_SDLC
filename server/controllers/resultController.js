import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import ViolationLog from '../models/ViolationLog.js';

export const submitTest = async (req, res, next) => {
  const { testId, answers: studentAnswers, timeTaken } = req.body;
  const studentId = req.user.id;

  try {
    const test = await Test.findById(testId).lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const now = new Date();
    if (now > new Date(new Date(test.endTime).getTime() + 60000)) {
      return res.status(400).json({ message: 'Test active window has already closed.' });
    }

    const existingResult = await Result.findOne({ studentId, testId }).select('_id').lean();
    if (existingResult) {
      return res.status(400).json({ message: 'You have already attempted this test.' });
    }

    const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found for this test.' });
    }

    let score = 0;
    let totalMarks = 0;
    const evaluatedAnswers = [];

    const questionMap = new Map();
    questions.forEach(q => {
      questionMap.set(q._id.toString(), q);
    });

    const processedQuestionIds = new Set();

    // Preserve the exact sequence in which the student attended/viewed questions
    if (Array.isArray(studentAnswers)) {
      studentAnswers.forEach(ans => {
        const qId = ans.questionId ? ans.questionId.toString() : '';
        const q = questionMap.get(qId);
        if (q && !processedQuestionIds.has(qId)) {
          processedQuestionIds.add(qId);
          const studentChoice = (ans.selectedOption || '').trim();
          const isCorrect = studentChoice.toUpperCase() === (q.correctAnswer || '').toUpperCase();
          if (isCorrect) {
            score += q.marks || 1;
          }
          totalMarks += q.marks || 1;
          evaluatedAnswers.push({
            questionId: q._id,
            selectedOption: studentChoice,
            isCorrect
          });
        }
      });
    }

    // Append any remaining questions from DB that weren't in studentAnswers
    questions.forEach(q => {
      const qId = q._id.toString();
      if (!processedQuestionIds.has(qId)) {
        processedQuestionIds.add(qId);
        totalMarks += q.marks || 1;
        evaluatedAnswers.push({
          questionId: q._id,
          selectedOption: '',
          isCorrect: false
        });
      }
    });

    const percentage = Number(((score / totalMarks) * 100).toFixed(2));
    const passed = score >= test.passMark;

    const newResult = new Result({
      studentId,
      testId,
      answers: evaluatedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      timeTaken: timeTaken || 0,
      submittedAt: now
    });

    const savedResult = await newResult.save();

    const resultDetails = await Result.findById(savedResult._id)
      .populate('testId', 'title subject duration passMark showResultsToStudents')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer marks order'
      });

    res.status(201).json({
      message: 'Test submitted and graded successfully',
      result: resultDetails
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsByTest = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const results = await Result.find({ testId })
      .populate('studentId', 'name rollNumber department batch year')
      .sort({ score: -1, timeTaken: 1 }); // Rank highest score first, ties broken by timeTaken

    // Clean up orphaned results where the student was deleted
    const orphans = results.filter(r => !r.studentId);
    if (orphans.length > 0) {
      const orphanIds = orphans.map(o => o._id);
      await Result.deleteMany({ _id: { $in: orphanIds } });
    }

    const validResults = results.filter(r => r.studentId);
    res.status(200).json(validResults);
  } catch (error) {
    next(error);
  }
};

export const getResultsByStudent = async (req, res, next) => {
  const { studentId } = req.params;

  // Security: Students can only view their own history
  if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== studentId) {
    return res.status(403).json({ message: 'Forbidden. You are not allowed to view this student\'s results.' });
  }

  try {
    const results = await Result.find({ studentId })
      .populate('testId', 'title subject totalMarks passMark startTime duration')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer marks order'
      })
      .sort({ submittedAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'name rollNumber department batch year')
      .populate('testId', 'title subject duration passMark totalMarks instructions showResultsToStudents')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer marks order'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result record not found' });
    }

    // Security: Students can only view their own results
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== result.studentId._id.toString()) {
      return res.status(403).json({ message: 'Forbidden. Access to this result is denied.' });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetStudentAttempt = async (req, res, next) => {
  const { studentId, testId } = req.params;

  try {
    const studentQuery = mongoose.Types.ObjectId.isValid(studentId)
      ? { $in: [studentId, new mongoose.Types.ObjectId(studentId)] }
      : studentId;
    const testQuery = mongoose.Types.ObjectId.isValid(testId)
      ? { $in: [testId, new mongoose.Types.ObjectId(testId)] }
      : testId;

    const filter = { studentId: studentQuery, testId: testQuery };

    const deletedResult = await Result.findOneAndDelete(filter);
    const deletedViolation = await ViolationLog.findOneAndDelete(filter);

    if (!deletedResult && !deletedViolation) {
      return res.status(404).json({ message: 'No result or violation log found for this student and test.' });
    }

    res.status(200).json({
      message: 'Candidate test attempt and violation log successfully reset. The student can now re-take the test.'
    });
  } catch (error) {
    next(error);
  }
};
export const deleteResultById = async (req, res, next) => {
  try {
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Result not found.' });
    }
    // Also clean up any violation log for the same student+test
    await ViolationLog.findOneAndDelete({
      studentId: deleted.studentId,
      testId: deleted.testId
    });
    res.status(200).json({ message: 'Result deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
