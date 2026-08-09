import Test from '../models/Test.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const allTests = await Test.find().lean();
    const totalStudents = await Student.countDocuments();

    // Helper to compute dynamic test status in real-time
    const computeStatus = (t) => {
      if (!t) return 'draft';
      if (t.status === 'draft') return 'draft';
      if (t.status === 'ended') return 'ended';
      const endTime = new Date(t.endTime);
      if (now > endTime) return 'ended';
      return 'active';
    };

    // Helper to identify College vs Institute tests reliably
    const isCollegeTest = (t) => {
      if (t.categoryMode === 'college') return true;
      if (t.categoryMode === 'institute') return false;
      if (t.assignedTo && t.assignedTo.length > 0) {
        const hasInstituteSpecific = t.assignedTo.some(a => 
          (a.batch && !/\d{4}/.test(a.batch) && !['All Batches'].includes(a.batch)) || 
          (a.department && !['CSE', 'ECE', 'MECH', 'EEE', 'IT', 'CIVIL', 'AI&DS', 'All Departments'].includes(a.department))
        );
        return !hasInstituteSpecific;
      }
      return true;
    };

    // Filter assessments by category
    const collegeTests = allTests.filter(isCollegeTest);
    const instituteTests = allTests.filter(t => !isCollegeTest(t));

    const totalTests = allTests.length;
    const totalCollegeTests = collegeTests.length;
    const totalInstituteTests = instituteTests.length;

    // Student counts
    const collegeStudents = await Student.countDocuments({ studentType: { $ne: 'institute' } });
    const instituteStudents = await Student.countDocuments({ studentType: 'institute' });

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

    // Fetch all populated results for granular category calculations
    const allResults = await Result.find()
      .populate('studentId', 'name rollNumber enrollmentId department courseTrack batch year email studentType center')
      .populate('testId', 'title subject categoryMode totalMarks passMark duration')
      .sort({ submittedAt: -1 });

    const validResults = allResults.filter(r => r.studentId && r.testId);

    // College vs Institute Submissions & Pass Rates
    const collegeResults = validResults.filter(r => r.studentId?.studentType !== 'institute');
    const instituteResults = validResults.filter(r => r.studentId?.studentType === 'institute');

    const collegePassed = collegeResults.filter(r => r.passed).length;
    const institutePassed = instituteResults.filter(r => r.passed).length;

    const collegePassRate = collegeResults.length > 0 
      ? Number(((collegePassed / collegeResults.length) * 100).toFixed(1)) 
      : 0;

    const institutePassRate = instituteResults.length > 0 
      ? Number(((institutePassed / instituteResults.length) * 100).toFixed(1)) 
      : 0;

    const collegeToday = collegeResults.filter(r => new Date(r.submittedAt) >= startOfToday).length;
    const instituteToday = instituteResults.filter(r => new Date(r.submittedAt) >= startOfToday).length;

    // Subject-wise average scores
    const subjectGroups = {};
    validResults.forEach(r => {
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
    const passFailRatio = [
      { name: 'Pass', value: passedAttempts },
      { name: 'Fail', value: Math.max(0, totalAttempts - passedAttempts) }
    ];

    // Recent activity table (latest valid submissions)
    const recentActivity = validResults.slice(0, 10);

    res.status(200).json({
      stats: {
        totalTests,
        totalStudents,
        todaysAttempts,
        totalSubmissions: totalAttempts,
        overallPassRate
      },
      collegeStats: {
        totalTests: totalCollegeTests,
        totalStudents: collegeStudents,
        todaysAttempts: collegeToday,
        totalSubmissions: collegeResults.length,
        overallPassRate: collegePassRate
      },
      instituteStats: {
        totalTests: totalInstituteTests,
        totalStudents: instituteStudents,
        todaysAttempts: instituteToday,
        totalSubmissions: instituteResults.length,
        overallPassRate: institutePassRate
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

export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Result.find()
      .populate('studentId', 'name rollNumber enrollmentId department courseTrack batch year email studentType center')
      .populate('testId', 'title subject totalMarks passMark duration categoryMode')
      .sort({ submittedAt: -1 });

    const validSubmissions = submissions.filter(r => r.studentId && r.testId);
    res.status(200).json(validSubmissions);
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
