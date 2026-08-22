import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import ViolationLog from '../models/ViolationLog.js';

// Helper to auto-heal orphaned or corrupted result records
const healResultRecord = async (resultDoc) => {
  if (!resultDoc || !resultDoc.testId) return resultDoc;

  try {
    const testId = resultDoc.testId._id ? resultDoc.testId._id : resultDoc.testId;
    const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
    if (questions.length === 0) return resultDoc;

    let needsSave = false;
    let score = 0;
    let totalMarks = 0;

    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q._id.toString(), q));

    const updatedAnswers = (resultDoc.answers || []).map((ans, idx) => {
      const qIdStr = ans.questionId ? (ans.questionId._id ? ans.questionId._id.toString() : ans.questionId.toString()) : '';
      let q = questionMap.get(qIdStr);

      // Fallback matching by index or order if ObjectId reference was lost
      if (!q) {
        if (questions[idx]) {
          q = questions[idx];
          ans.questionId = q._id;
          needsSave = true;
        }
      }

      if (q) {
        const studentChoice = (ans.selectedOption || '').trim();
        const isCorrect = studentChoice.toUpperCase() === (q.correctAnswer || '').trim().toUpperCase();
        if (ans.isCorrect !== isCorrect) {
          ans.isCorrect = isCorrect;
          needsSave = true;
        }
        const qMarks = q.marks || 1;
        if (isCorrect) {
          score += qMarks;
        }
        totalMarks += qMarks;
      }

      return ans;
    });

    if (totalMarks > 0) {
      const percentage = Number(((score / totalMarks) * 100).toFixed(2));
      const testPassMark = resultDoc.testId?.passMark || 0;
      const passed = score >= testPassMark;

      if (resultDoc.score !== score || resultDoc.totalMarks !== totalMarks || resultDoc.percentage !== percentage || resultDoc.passed !== passed) {
        resultDoc.score = score;
        resultDoc.totalMarks = totalMarks;
        resultDoc.percentage = percentage;
        resultDoc.passed = passed;
        needsSave = true;
      }
    }

    if (needsSave && typeof resultDoc.save === 'function') {
      resultDoc.answers = updatedAnswers;
      await resultDoc.save();
    }
  } catch (err) {
    console.error('Error auto-healing result record:', err);
  }

  return resultDoc;
};

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

    // Preserve the exact sequence in which the student attended/viewed questions with fallback matching
    if (Array.isArray(studentAnswers)) {
      studentAnswers.forEach((ans, idx) => {
        const qId = ans.questionId ? ans.questionId.toString() : '';
        let q = questionMap.get(qId);

        // Fallback 1: Match by array index if questionId mismatch occurred due to resync
        if (!q && idx < questions.length) {
          q = questions[idx];
        }

        if (q && !processedQuestionIds.has(q._id.toString())) {
          processedQuestionIds.add(q._id.toString());
          const studentChoice = (ans.selectedOption || '').trim();
          const isCorrect = studentChoice.toUpperCase() === (q.correctAnswer || '').trim().toUpperCase();
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

    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const passed = score >= test.passMark;

    const subType = req.body.submissionType || (req.body.isAutoSubmit ? 'security_violation' : 'manual');

    const newResult = new Result({
      studentId,
      testId,
      answers: evaluatedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      timeTaken: timeTaken || 0,
      submissionType: subType,
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
    const test = await Test.findById(testId).lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const results = await Result.find({ testId })
      .populate('studentId', 'name rollNumber department batch year email')
      .sort({ score: -1, timeTaken: 1 }); // Rank highest score first, ties broken by timeTaken

    // Clean up orphaned results where the student was deleted
    const orphans = results.filter(r => !r.studentId);
    if (orphans.length > 0) {
      const orphanIds = orphans.map(o => o._id);
      await Result.deleteMany({ _id: { $in: orphanIds } });
    }

    const validResults = results.filter(r => r.studentId);

    // Auto-heal any corrupted or orphaned result scores in background
    for (let r of validResults) {
      await healResultRecord(r);
    }

    // Determine eligible cohort students based on test.assignedTo
    let eligibleStudents = [];
    if (test.assignedTo && test.assignedTo.length > 0) {
      const queryConditions = test.assignedTo.map(assign => {
        const condition = {};
        if (assign.department && !['All Departments', 'ALL', ''].includes(assign.department)) {
          condition.department = assign.department;
        }
        if (assign.batch && !['All Batches', 'ALL', ''].includes(assign.batch)) {
          condition.batch = assign.batch;
        }
        if (assign.year && !['All Years', 'ALL', ''].includes(assign.year)) {
          condition.year = assign.year;
        }
        return condition;
      });

      if (queryConditions.some(c => Object.keys(c).length === 0)) {
        eligibleStudents = await Student.find().select('name rollNumber department batch year email').lean();
      } else {
        eligibleStudents = await Student.find({ $or: queryConditions }).select('name rollNumber department batch year email').lean();
      }
    } else {
      eligibleStudents = await Student.find().select('name rollNumber department batch year email').lean();
    }

    const submittedStudentIdSet = new Set(
      validResults.map(r => (r.studentId._id ? r.studentId._id.toString() : r.studentId.toString()))
    );

    const pendingStudents = eligibleStudents.filter(
      student => !submittedStudentIdSet.has(student._id.toString())
    );

    const totalEligible = eligibleStudents.length;
    const submittedCount = validResults.length;
    const pendingCount = pendingStudents.length;
    const completionRate = totalEligible > 0 ? Number(((submittedCount / totalEligible) * 100).toFixed(1)) : 0;

    res.status(200).json({
      summary: {
        totalEligible,
        submittedCount,
        pendingCount,
        completionRate
      },
      results: validResults,
      pendingStudents
    });
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

    for (let r of results) {
      await healResultRecord(r);
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (req, res, next) => {
  try {
    let result = await Result.findById(req.params.id)
      .populate('studentId', 'name rollNumber department batch year')
      .populate('testId', 'title subject duration passMark totalMarks instructions showResultsToStudents')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer marks order'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result record not found' });
    }

    // Auto-heal orphaned or corrupted score data
    await healResultRecord(result);

    // Re-fetch populated result after auto-heal
    result = await Result.findById(req.params.id)
      .populate('studentId', 'name rollNumber department batch year')
      .populate('testId', 'title subject duration passMark totalMarks instructions showResultsToStudents')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer marks order'
      });

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
