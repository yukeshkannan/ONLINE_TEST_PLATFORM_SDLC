import Question from '../models/Question.js';
import Test from '../models/Test.js';

export const addQuestions = async (req, res, next) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk Import
      const questionsData = req.body;
      if (questionsData.length === 0) {
        return res.status(400).json({ message: 'No questions provided for bulk import.' });
      }

      const testId = questionsData[0].testId;
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ message: 'Associated test not found' });
      }

      // Check and add sequential ordering if missing
      const existingCount = await Question.countDocuments({ testId });
      const processedQuestions = questionsData.map((q, index) => ({
        ...q,
        order: q.order !== undefined ? q.order : existingCount + index + 1
      }));

      const savedQuestions = await Question.insertMany(processedQuestions);
      
      // Update test total marks automatically based on sum of question marks
      const allQuestions = await Question.find({ testId });
      const totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      test.totalMarks = totalMarks;
      await test.save();

      return res.status(201).json({
        message: `${savedQuestions.length} questions imported successfully`,
        questions: savedQuestions,
        testTotalMarks: totalMarks
      });
    } else {
      // Single Question Add
      const { testId, questionText, options, correctAnswer, marks, order } = req.body;

      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ message: 'Associated test not found' });
      }

      const existingCount = await Question.countDocuments({ testId });
      const newQuestion = new Question({
        testId,
        questionText,
        options,
        correctAnswer,
        marks: marks || 1,
        order: order !== undefined ? order : existingCount + 1
      });

      const savedQuestion = await newQuestion.save();

      // Recalculate and update test total marks
      const allQuestions = await Question.find({ testId });
      const totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      test.totalMarks = totalMarks;
      await test.save();

      return res.status(201).json({
        message: 'Question added successfully',
        question: savedQuestion,
        testTotalMarks: totalMarks
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { questionText, options, correctAnswer, marks, order } = req.body;

    question.questionText = questionText !== undefined ? questionText : question.questionText;
    question.options = options !== undefined ? options : question.options;
    question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
    question.marks = marks !== undefined ? marks : question.marks;
    question.order = order !== undefined ? order : question.order;

    const updatedQuestion = await question.save();

    // Recalculate test total marks
    const test = await Test.findById(question.testId);
    if (test) {
      const allQuestions = await Question.find({ testId: test._id });
      test.totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      await test.save();
    }

    res.status(200).json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const testId = question.testId;
    await Question.findByIdAndDelete(req.params.id);

    // Recalculate test total marks after deletion
    const test = await Test.findById(testId);
    if (test) {
      const allQuestions = await Question.find({ testId });
      test.totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      await test.save();
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const syncQuestions = async (req, res, next) => {
  const { testId } = req.params;
  const questionsData = req.body || [];

  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Associated test not found' });
    }

    // Fetch existing questions sorted by order
    const existingQuestions = await Question.find({ testId }).sort({ order: 1 });

    const finalQuestions = [];

    // Update existing questions in-place to preserve ObjectId (_id) references
    for (let i = 0; i < questionsData.length; i++) {
      const qData = questionsData[i];
      const qOrder = i + 1;

      if (i < existingQuestions.length) {
        const existingQ = existingQuestions[i];
        existingQ.questionText = qData.questionText;
        existingQ.options = qData.options;
        existingQ.correctAnswer = qData.correctAnswer;
        existingQ.marks = qData.marks || 1;
        existingQ.order = qOrder;
        const saved = await existingQ.save();
        finalQuestions.push(saved);
      } else {
        const newQ = new Question({
          testId,
          questionText: qData.questionText,
          options: qData.options,
          correctAnswer: qData.correctAnswer,
          marks: qData.marks || 1,
          order: qOrder
        });
        const saved = await newQ.save();
        finalQuestions.push(saved);
      }
    }

    // If new list has fewer questions than existing, clean up the extra ones
    if (existingQuestions.length > questionsData.length) {
      const extraIds = existingQuestions.slice(questionsData.length).map(q => q._id);
      await Question.deleteMany({ _id: { $in: extraIds } });
    }

    test.totalMarks = finalQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
    await test.save();

    res.status(200).json({
      message: 'Questions synced successfully',
      testTotalMarks: test.totalMarks
    });
  } catch (error) {
    next(error);
  }
};

