import ViolationLog from '../models/ViolationLog.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';

export const logViolation = async (req, res, next) => {
  const { testId, violationType = 'tab_switch', autoSubmitted = false } = req.body;
  const studentId = req.user.id;

  try {
    if (!testId) {
      return res.status(400).json({ message: 'testId is required.' });
    }

    // Upsert: find existing doc and increment, or create new
    const existing = await ViolationLog.findOne({ studentId, testId });

    if (existing) {
      existing.count += 1;
      existing.events.push({ timestamp: new Date(), type: violationType });
      if (autoSubmitted) existing.autoSubmitted = true;
      existing.updatedAt = new Date();
      await existing.save();
      return res.status(200).json({ count: existing.count, message: 'Violation updated.' });
    } else {
      const newLog = await ViolationLog.create({
        studentId,
        testId,
        violationType,
        count: 1,
        events: [{ timestamp: new Date(), type: violationType }],
        autoSubmitted
      });
      return res.status(201).json({ count: newLog.count, message: 'Violation logged.' });
    }
  } catch (error) {
    next(error);
  }
};

export const markAutoSubmitted = async (req, res, next) => {
  const { testId } = req.body;
  const studentId = req.user.id;

  try {
    await ViolationLog.findOneAndUpdate(
      { studentId, testId },
      { autoSubmitted: true, updatedAt: new Date() }
    );
    res.status(200).json({ message: 'Marked as auto-submitted.' });
  } catch (error) {
    next(error);
  }
};

export const getAllViolations = async (req, res, next) => {
  try {
    const logs = await ViolationLog.find()
      .populate('studentId', 'name rollNumber department batch year')
      .populate('testId', 'title subject')
      .sort({ updatedAt: -1 });

    // Clean up orphaned logs where the student was deleted
    const orphans = logs.filter(log => !log.studentId);
    if (orphans.length > 0) {
      const orphanIds = orphans.map(o => o._id);
      await ViolationLog.deleteMany({ _id: { $in: orphanIds } });
    }

    const validLogs = logs.filter(log => log.studentId);
    res.status(200).json(validLogs);
  } catch (error) {
    next(error);
  }
};

export const getViolationsByTest = async (req, res, next) => {
  try {
    const logs = await ViolationLog.find({ testId: req.params.testId })
      .populate('studentId', 'name rollNumber department batch year')
      .populate('testId', 'title subject')
      .sort({ count: -1 });

    // Clean up orphaned logs where the student was deleted
    const orphans = logs.filter(log => !log.studentId);
    if (orphans.length > 0) {
      const orphanIds = orphans.map(o => o._id);
      await ViolationLog.deleteMany({ _id: { $in: orphanIds } });
    }

    const validLogs = logs.filter(log => log.studentId);
    res.status(200).json(validLogs);
  } catch (error) {
    next(error);
  }
};
