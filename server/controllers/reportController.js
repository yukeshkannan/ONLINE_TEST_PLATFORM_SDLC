import Test from '../models/Test.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalTests = await Test.countDocuments();
    const totalStudents = await Student.countDocuments();

    // Today's Attempts
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysAttempts = await Result.countDocuments({
      submittedAt: { $gte: startOfToday }
    });

    // Overall Pass Rate
    const totalAttempts = await Result.countDocuments();
    const passedAttempts = await Result.countDocuments({ passed: true });
    const overallPassRate = totalAttempts > 0 
      ? Number(((passedAttempts / totalAttempts) * 100).toFixed(1)) 
      : 0;

    // Subject-wise average scores (using Mongoose data mapping)
    const allResults = await Result.find().populate('testId', 'subject title');
    const subjectGroups = {};
    allResults.forEach(r => {
      if (r.testId && r.testId.subject) {
        const sub = r.testId.subject;
        if (!subjectGroups[sub]) {
          subjectGroups[sub] = { sum: 0, count: 0 };
        }
        subjectGroups[sub].sum += r.percentage;
        subjectGroups[sub].count += 1;
      }
    });

    const subjectAverages = Object.keys(subjectGroups).map(sub => ({
      subject: sub,
      averageScore: Number((subjectGroups[sub].sum / subjectGroups[sub].count).toFixed(1))
    }));

    // Pass vs Fail counts
    const passCount = passedAttempts;
    const failCount = totalAttempts - passedAttempts;
    const passFailRatio = [
      { name: 'Pass', value: passCount },
      { name: 'Fail', value: failCount }
    ];

    // Recent activity table (last 5 valid submissions — skip orphaned records)
    const rawActivity = await Result.find()
      .populate('studentId', 'name rollNumber department')
      .populate('testId', 'title subject')
      .sort({ submittedAt: -1 })
      .limit(20);

    // Auto-cleanup: permanently delete orphaned records (student or test was deleted)
    const orphanIds = rawActivity
      .filter(r => !r.studentId || !r.testId)
      .map(r => r._id);
    if (orphanIds.length > 0) {
      await Result.deleteMany({ _id: { $in: orphanIds } });
    }

    // Keep only valid records, show latest 5
    const recentActivity = rawActivity
      .filter(r => r.studentId && r.testId)
      .slice(0, 5);
    res.status(200).json({
      stats: {
        totalTests,
        totalStudents,
        todaysAttempts,
        totalSubmissions: totalAttempts,
        overallPassRate
      },
      charts: {
        subjectAverages,
        passFailRatio
      },
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

export const downloadExcelReport = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const workbook = await generateExcelReport(testId);

    // Format safe filename
    const safeTitle = test.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `test-report-${safeTitle}-${testId.slice(-4)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
