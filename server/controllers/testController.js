import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';

const computeTestStatus = (test, now = new Date()) => {
  if (!test) return 'draft';
  if (test.status === 'draft') return 'draft';
  if (test.status === 'ended') return 'ended';

  const endTime = new Date(test.endTime);
  if (now > endTime) return 'ended';
  return 'active';
};

export const getTests = async (req, res, next) => {
  try {
    const now = new Date();

    if (req.user.role === 'admin' || req.user.role === 'trainer') {
      const tests = await Test.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      
      const updatedTests = tests.map(t => ({
        ...t,
        status: computeTestStatus(t, now)
      }));
      return res.status(200).json(updatedTests);
    } else {
      const student = await Student.findById(req.user.id).select('department courseTrack batch year studentType center').lean();
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const isInstitute = student.studentType === 'institute';

      const deptMatches = [
        student.department,
        student.courseTrack,
        isInstitute ? student.center : null,
        'All Departments',
        'All Tracks',
        'ALL',
        ''
      ].filter(Boolean);

      const batchMatches = [
        student.batch,
        student.courseTrack,
        'All Batches',
        'ALL',
        ''
      ].filter(Boolean);

      const yearMatches = [
        student.year,
        'All Years',
        'ALL',
        ''
      ].filter(Boolean);

      const filter = {
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: { $size: 0 } },
          { 'assignedTo.department': { $in: deptMatches } },
          { 'assignedTo.batch': { $in: batchMatches } },
          { 'assignedTo.year': { $in: yearMatches } },
          {
            assignedTo: {
              $elemMatch: {
                $or: [
                  { department: { $in: deptMatches } },
                  { batch: { $in: batchMatches } },
                  { year: { $in: yearMatches } }
                ]
              }
            }
          }
        ]
      };

      const tests = await Test.find(filter)
        .sort({ startTime: -1 })
        .lean();

      // For students, deliver all assigned tests (active, upcoming, or ended)
      const studentVisibleTests = tests.map(t => ({
        ...t,
        status: computeTestStatus(t, now)
      }));

      const studentResults = await Result.find({ studentId: req.user.id })
        .select('testId score passed percentage _id')
        .lean();
      
      const resultLookup = new Map(studentResults.map(r => [r.testId.toString(), r]));

      const testsWithResultStatus = studentVisibleTests.map(test => {
        const result = resultLookup.get(test._id.toString());
        return {
          ...test,
          attempted: !!result,
          score: result ? result.score : null,
          passed: result ? result.passed : null,
          percentage: result ? result.percentage : null,
          resultId: result ? result._id : null
        };
      });

      return res.status(200).json(testsWithResultStatus);
    }
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.id || req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.status = computeTestStatus(test);
    res.status(200).json(test);
  } catch (error) {
    next(error);
  }
};

export const createTest = async (req, res, next) => {
  const { title, subject, description, duration, totalMarks, passMark, instructions, assignedTo, startTime, endTime, status, showResultsToStudents } = req.body;

  try {
    const now = new Date();
    let sTime = new Date(startTime);
    let eTime = new Date(endTime);

    const newTest = new Test({
      title,
      subject,
      description,
      duration,
      totalMarks,
      passMark,
      instructions,
      createdBy: req.user.id,
      assignedTo,
      startTime: sTime,
      endTime: eTime,
      status: status || 'draft',
      showResultsToStudents: showResultsToStudents !== undefined ? showResultsToStudents : true
    });

    const savedTest = await newTest.save();
    const resultObj = savedTest.toObject();
    resultObj.status = computeTestStatus(resultObj, now);

    res.status(201).json(resultObj);
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const { title, subject, description, duration, totalMarks, passMark, instructions, assignedTo, startTime, endTime, status, showResultsToStudents } = req.body;

    test.title = title !== undefined ? title : test.title;
    test.subject = subject !== undefined ? subject : test.subject;
    test.description = description !== undefined ? description : test.description;
    test.duration = duration !== undefined ? duration : test.duration;
    test.totalMarks = totalMarks !== undefined ? totalMarks : test.totalMarks;
    test.passMark = passMark !== undefined ? passMark : test.passMark;
    test.instructions = instructions !== undefined ? instructions : test.instructions;
    test.assignedTo = assignedTo !== undefined ? assignedTo : test.assignedTo;
    test.showResultsToStudents = showResultsToStudents !== undefined ? showResultsToStudents : test.showResultsToStudents;
    
    if (startTime) test.startTime = new Date(startTime);
    if (endTime) test.endTime = new Date(endTime);
    if (status) test.status = status;

    const updatedTest = await test.save();
    const now = new Date();
    const resultObj = updatedTest.toObject();
    resultObj.status = computeTestStatus(resultObj, now);

    res.status(200).json(resultObj);
  } catch (error) {
    next(error);
  }
};

export const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Delete all associated questions first
    await Question.deleteMany({ testId: test._id });
    
    // Delete test
    await Test.findByIdAndDelete(test._id);

    res.status(200).json({ message: 'Test and associated questions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const duplicateTest = async (req, res, next) => {
  try {
    const sourceTest = await Test.findById(req.params.id);
    if (!sourceTest) {
      return res.status(404).json({ message: 'Source test not found' });
    }

    // Duplicate test details
    const duplicatedTest = new Test({
      title: `${sourceTest.title} (Copy)`,
      subject: sourceTest.subject,
      description: sourceTest.description,
      duration: sourceTest.duration,
      totalMarks: sourceTest.totalMarks,
      passMark: sourceTest.passMark,
      instructions: sourceTest.instructions,
      createdBy: req.user.id,
      assignedTo: sourceTest.assignedTo,
      startTime: sourceTest.startTime,
      endTime: sourceTest.endTime,
      status: 'draft', // Set duplicated tests as draft by default
      showResultsToStudents: sourceTest.showResultsToStudents
    });

    const savedTest = await duplicatedTest.save();

    // Duplicate all questions associated with the test
    const questions = await Question.find({ testId: sourceTest._id }).sort({ order: 1 });
    
    const duplicatedQuestions = questions.map(q => {
      return {
        testId: savedTest._id,
        questionText: q.questionText,
        options: q.options.map(opt => ({ label: opt.label, text: opt.text })),
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        order: q.order
      };
    });

    if (duplicatedQuestions.length > 0) {
      await Question.insertMany(duplicatedQuestions);
    }

    res.status(201).json({
      message: 'Test duplicated successfully',
      test: savedTest,
      questionsCount: duplicatedQuestions.length
    });
  } catch (error) {
    next(error);
  }
};

export const getTestQuestions = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Fetch questions sorted by order
    const questions = await Question.find({ testId: test._id }).sort({ order: 1 }).lean();

    if (req.user.role === 'admin' || req.user.role === 'trainer') {
      // Admins and trainers get questions with correct answers
      return res.status(200).json(questions);
    } else {
      const student = await Student.findById(req.user.id).select('_id').lean();
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const now = new Date();
      const currentStatus = computeTestStatus(test, now);
      if (currentStatus !== 'active') {
        return res.status(403).json({ message: 'Test is not active' });
      }

      // Check if student has already submitted this test
      const existingResult = await Result.findOne({ studentId: req.user.id, testId: test._id }).select('_id').lean();
      if (existingResult) {
        return res.status(403).json({ message: 'You have already attempted this test.' });
      }

      // Sanitize correctAnswers efficiently without Mongoose toObject overhead
      const sanitizedQuestions = questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });

      return res.status(200).json(sanitizedQuestions);
    }
  } catch (error) {
    next(error);
  }
};
