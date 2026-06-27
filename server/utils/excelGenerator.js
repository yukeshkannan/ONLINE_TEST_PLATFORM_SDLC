import ExcelJS from 'exceljs';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';

export const generateExcelReport = async (testId) => {
  // 1. Fetch all data
  const test = await Test.findById(testId).populate('createdBy', 'name email');
  if (!test) {
    throw new Error('Test not found');
  }

  const questions = await Question.find({ testId }).sort({ order: 1 });
  const results = await Result.find({ testId })
    .populate('studentId')
    .sort({ score: -1, timeTaken: 1 });

  // Find eligible students based on test assignments
  let eligibleCount = 0;
  if (test.assignedTo && test.assignedTo.length > 0) {
    const queryConditions = test.assignedTo.map(assign => ({
      department: assign.department,
      batch: assign.batch,
      year: assign.year
    }));
    eligibleCount = await Student.countDocuments({ $or: queryConditions });
  }

  // Calculate aggregates
  const appeared = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = appeared - passed;
  
  let highestScore = 0;
  let lowestScore = 0;
  let averageScore = 0;
  let passPercentage = 0;

  if (appeared > 0) {
    const scores = results.map(r => r.score);
    highestScore = Math.max(...scores);
    lowestScore = Math.min(...scores);
    averageScore = Number((scores.reduce((sum, s) => sum + s, 0) / appeared).toFixed(2));
    passPercentage = Number(((passed / appeared) * 100).toFixed(2));
  }

  // 2. Create Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Antigravity Test Platform';
  workbook.lastModifiedBy = 'Admin';
  workbook.created = new Date();

  // ==========================================
  // SHEET 1: TEST SUMMARY
  // ==========================================
  const summarySheet = workbook.addWorksheet('Test Summary');
  summarySheet.views = [{ showGridLines: true }];

  // Title Block
  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'ONLINE TESTING PLATFORM - TEST EXECUTIVE SUMMARY';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0D5C4A' } // Deep Emerald Green
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 40;

  // Metadata Subheaders
  const metaRows = [
    ['Test Title', test.title, 'Subject', test.subject],
    ['Duration (mins)', test.duration, 'Total Marks', test.totalMarks],
    ['Scheduled Start', new Date(test.startTime).toLocaleString(), 'Scheduled End', new Date(test.endTime).toLocaleString()],
    ['Pass Mark', test.passMark, 'Created By', test.createdBy ? test.createdBy.name : 'System']
  ];
  metaRows.forEach((row, i) => {
    const addedRow = summarySheet.addRow(row);
    addedRow.getCell(1).font = { bold: true };
    addedRow.getCell(3).font = { bold: true };
  });

  summarySheet.addRow([]); // Blank row

  // Aggregate Header
  summarySheet.mergeCells('A7:D7');
  const aggHeaderCell = summarySheet.getCell('A7');
  aggHeaderCell.value = 'PARTICIPATION & PERFORMANCE STATS';
  aggHeaderCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  aggHeaderCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1A1A1A' }
  };
  aggHeaderCell.alignment = { horizontal: 'center' };
  summarySheet.getRow(7).height = 25;

  // Aggregate Data Rows
  summarySheet.addRow(['Total Eligible Students', eligibleCount, 'Total Appeared', appeared]);
  summarySheet.addRow(['Total Passed', passed, 'Total Failed', failed]);
  summarySheet.addRow(['Highest Score Obtain', highestScore, 'Lowest Score Obtain', lowestScore]);
  summarySheet.addRow(['Average Score', averageScore, 'Pass Percentage (%)', `${passPercentage}%`]);

  // Styling Data Rows in Summary
  for (let r = 8; r <= 11; r++) {
    const row = summarySheet.getRow(r);
    row.getCell(1).font = { bold: true };
    row.getCell(3).font = { bold: true };
    row.getCell(2).alignment = { horizontal: 'left' };
    row.getCell(4).alignment = { horizontal: 'left' };
  }

  // Adjust columns widths
  summarySheet.columns = [
    { width: 25 },
    { width: 30 },
    { width: 25 },
    { width: 30 }
  ];

  // ==========================================
  // SHEET 2: STUDENT RESULTS
  // ==========================================
  const resultsSheet = workbook.addWorksheet('Student Leaderboard');
  resultsSheet.views = [{ showGridLines: true }];

  // Title Block
  resultsSheet.mergeCells('A1:J1');
  const titleCell2 = resultsSheet.getCell('A1');
  titleCell2.value = `STUDENT LEADERBOARD - ${test.title.toUpperCase()}`;
  titleCell2.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0D5C4A' }
  };
  titleCell2.alignment = { horizontal: 'center', vertical: 'middle' };
  resultsSheet.getRow(1).height = 30;

  // Table Headers
  const studentHeaders = ['Rank', 'Name', 'Roll No', 'Department', 'Batch', 'Score Obtained', 'Total Marks', 'Percentage (%)', 'Result Status', 'Time Taken (Mins)'];
  const headerRow2 = resultsSheet.addRow(studentHeaders);
  headerRow2.height = 25;
  headerRow2.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1A1A1A' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Data Loading and Styling
  results.forEach((resItem, index) => {
    const durationMins = Number((resItem.timeTaken / 60).toFixed(2));
    const studentName = resItem.studentId ? resItem.studentId.name : 'Unknown';
    const rollNo = resItem.studentId ? resItem.studentId.rollNumber : 'N/A';
    const dept = resItem.studentId ? resItem.studentId.department : 'N/A';
    const batch = resItem.studentId ? resItem.studentId.batch : 'N/A';
    
    const rowData = [
      index + 1, // Rank
      studentName,
      rollNo,
      dept,
      batch,
      resItem.score,
      resItem.totalMarks,
      resItem.percentage,
      resItem.passed ? 'PASS' : 'FAIL',
      durationMins
    ];

    const dataRow = resultsSheet.addRow(rowData);
    dataRow.height = 20;

    // Apply color coding
    // Passed: Soft green `#E2F0D9`
    // Failed: Soft red `#FCE4D6`
    const fillColor = resItem.passed ? 'E2F0D9' : 'FCE4D6';
    const textColor = resItem.passed ? '385723' : 'C00000';

    dataRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillColor }
      };
      cell.font = { color: { argb: textColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
        right: { style: 'thin', color: { argb: 'D9D9D9' } }
      };
    });

    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' }; // Name left-aligned
  });

  resultsSheet.columns = [
    { width: 8 },  // Rank
    { width: 25 }, // Name
    { width: 15 }, // Roll No
    { width: 15 }, // Dept
    { width: 10 }, // Batch
    { width: 16 }, // Score
    { width: 16 }, // Total Marks
    { width: 16 }, // Percentage
    { width: 16 }, // Pass/Fail
    { width: 20 }  // Time Taken
  ];

  // ==========================================
  // SHEET 3: QUESTION ANALYSIS
  // ==========================================
  const questionsSheet = workbook.addWorksheet('Question Performance');
  questionsSheet.views = [{ showGridLines: true }];

  // Title Block
  questionsSheet.mergeCells('A1:F1');
  const titleCell3 = questionsSheet.getCell('A1');
  titleCell3.value = `ITEM ANALYSIS & DISTRACTOR METRICS - ${test.title.toUpperCase()}`;
  titleCell3.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell3.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0D5C4A' }
  };
  titleCell3.alignment = { horizontal: 'center', vertical: 'middle' };
  questionsSheet.getRow(1).height = 30;

  // Table Headers
  const questionHeaders = ['Q.No', 'Question text', 'Correct Attempts', 'Wrong Attempts', 'Skip Count', 'Accuracy (%)'];
  const headerRow3 = questionsSheet.addRow(questionHeaders);
  headerRow3.height = 25;
  headerRow3.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1A1A1A' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Calculate stats for each question
  questions.forEach((q, index) => {
    let correctAttempts = 0;
    let wrongAttempts = 0;
    let skipCount = 0;

    results.forEach(resItem => {
      const qAns = resItem.answers.find(ans => ans.questionId.toString() === q._id.toString());
      if (qAns) {
        if (!qAns.selectedOption || qAns.selectedOption === '') {
          skipCount++;
        } else if (qAns.isCorrect) {
          correctAttempts++;
        } else {
          wrongAttempts++;
        }
      } else {
        skipCount++;
      }
    });

    const totalStudents = results.length;
    const accuracy = totalStudents > 0 ? Number(((correctAttempts / totalStudents) * 100).toFixed(2)) : 0;

    const rowData = [
      q.order || index + 1,
      q.questionText.replace(/<[^>]*>/g, ''), // Strip tags for neat display
      correctAttempts,
      wrongAttempts,
      skipCount,
      accuracy
    ];

    const dataRow = questionsSheet.addRow(rowData);
    dataRow.height = 20;

    // Hardest questions: Accuracy < 40%
    // Highlight in Amber/Gold `#FFF2CC`
    const isHard = accuracy < 40;
    const fillColor = isHard ? 'FFF2CC' : 'FFFFFF';
    const textColor = isHard ? '7F6000' : '000000';

    dataRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillColor }
      };
      cell.font = { color: { argb: textColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
        right: { style: 'thin', color: { argb: 'D9D9D9' } }
      };
    });

    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' }; // Question text left-aligned
    dataRow.getCell(6).value = `${accuracy}%`; // Append percentage visual
  });

  questionsSheet.columns = [
    { width: 8 },  // Q.No
    { width: 50 }, // Question Text
    { width: 18 }, // Correct
    { width: 18 }, // Wrong
    { width: 15 }, // Skips
    { width: 15 }  // Accuracy %
  ];

  return workbook;
};
