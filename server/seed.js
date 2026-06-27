import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import Admin from './models/Admin.js';
import Student from './models/Student.js';
import Test from './models/Test.js';
import Question from './models/Question.js';
import Result from './models/Result.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mcq-test-platform';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // 1. Purge Existing Collections
    console.log('Purging old data...');
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Test.deleteMany({});
    await Question.deleteMany({});
    await Result.deleteMany({});
    console.log('Purged old data.');

    // 2. Generate Hashed Passwords
    console.log('Hashing passwords...');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const studentPasswordHash = await bcrypt.hash('Student@123', 12);

    // 3. Create 2 Admin Accounts
    console.log('Creating Admin records...');
    const admins = await Admin.insertMany([
      {
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: adminPasswordHash,
        department: 'Computer Science',
        role: 'admin'
      },
      {
        name: 'Prof. Alan Turing',
        email: 'alan.turing@college.edu',
        password: adminPasswordHash,
        department: 'Information Technology',
        role: 'admin'
      }
    ]);
    console.log(`Successfully seeded ${admins.length} Admins.`);
    const adminId = admins[0]._id;

    // 4. Create 10 Student Accounts
    console.log('Creating Student records...');
    const studentsData = [
      { name: 'John Doe', rollNumber: 'CS23001', email: 'john@gmail.com', department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
      { name: 'Alice Smith', rollNumber: 'CS23002', email: 'alice@gmail.com', department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
      { name: 'Bob Johnson', rollNumber: 'CS23003', email: 'bob@gmail.com', department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
      { name: 'Emma Watson', rollNumber: 'CS23004', email: 'emma@gmail.com', department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
      { name: 'Charlie Brown', rollNumber: 'CS23005', email: 'charlie@gmail.com', department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
      { name: 'Diana Prince', rollNumber: 'IT23001', email: 'diana@gmail.com', department: 'Information Technology', batch: '2023-2027', year: '3rd Year' },
      { name: 'Clark Kent', rollNumber: 'IT23002', email: 'clark@gmail.com', department: 'Information Technology', batch: '2023-2027', year: '3rd Year' },
      { name: 'Bruce Wayne', rollNumber: 'EC23001', email: 'bruce@gmail.com', department: 'Electronics', batch: '2023-2027', year: '3rd Year' },
      { name: 'Peter Parker', rollNumber: 'EC23002', email: 'peter@gmail.com', department: 'Electronics', batch: '2023-2027', year: '3rd Year' },
      { name: 'Tony Stark', rollNumber: 'CS24001', email: 'tony@gmail.com', department: 'Computer Science', batch: '2024-2028', year: '2nd Year' }
    ];

    // Dynamically hash student passwords (roll number)
    for (let i = 0; i < studentsData.length; i++) {
      studentsData[i].password = await bcrypt.hash(studentsData[i].rollNumber, 12);
    }

    const students = await Student.insertMany(studentsData);
    console.log(`Successfully seeded ${students.length} Students.`);

    // 5. Create 3 Tests
    console.log('Creating Test configurations...');
    const now = new Date();
    
    // Set test schedules
    // Test 1: Mathematics - Active now! Starts 2 hours ago, ends 24 hours from now
    const mathStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const mathEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Test 2: Computer Science - Active now! Starts 1 hour ago, ends 12 hours from now
    const csStart = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const csEnd = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // Test 3: Aptitude & Logic - Ended! Started 3 hours ago, ended 1 hour ago
    const aptStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const aptEnd = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    const testTemplates = [
      {
        title: 'Linear Algebra & Calculus',
        subject: 'Mathematics',
        description: 'Semester evaluation test covering vector spaces, eigenvalues, and multi-variable calculus.',
        duration: 30, // 30 minutes
        totalMarks: 5,
        passMark: 3,
        instructions: '1. Ensure stable internet. 2. Tab changes are tracked. 3. Fullscreen mode is enforced.',
        createdBy: adminId,
        assignedTo: [
          { department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
          { department: 'Information Technology', batch: '2023-2027', year: '3rd Year' }
        ],
        startTime: mathStart,
        endTime: mathEnd,
        status: 'active'
      },
      {
        title: 'Core Concepts in Algorithms & OS',
        subject: 'Computer Science',
        description: 'Comprehensive test covering dynamic programming, process scheduling, and concurrency control.',
        duration: 45, // 45 minutes
        totalMarks: 5,
        passMark: 3,
        instructions: '1. Attempt all questions. 2. There is no negative marking. 3. Ensure full-screen window focus.',
        createdBy: adminId,
        assignedTo: [
          { department: 'Computer Science', batch: '2023-2027', year: '3rd Year' }
        ],
        startTime: csStart,
        endTime: csEnd,
        status: 'active'
      },
      {
        title: 'Cognitive & Quantitative Aptitude',
        subject: 'Aptitude & Logic',
        description: 'Standard practice evaluation test for quantitative aptitude, coding-decoding, and syllogisms.',
        duration: 20, // 20 minutes
        totalMarks: 5,
        passMark: 2,
        instructions: '1. Standard quantitative tests. 2. Time-critical speed rounds.',
        createdBy: adminId,
        assignedTo: [
          { department: 'Computer Science', batch: '2023-2027', year: '3rd Year' },
          { department: 'Electronics', batch: '2023-2027', year: '3rd Year' }
        ],
        startTime: aptStart,
        endTime: aptEnd,
        status: 'ended' // Finished exam
      }
    ];

    const tests = await Test.insertMany(testTemplates);
    console.log(`Successfully seeded ${tests.length} Tests.`);

    // 6. Seed 5 Questions per Test
    console.log('Seeding Questions...');
    const questionsData = [];

    // Mathematics Questions
    questionsData.push(
      {
        testId: tests[0]._id,
        questionText: 'What is the dimension of the vector space of all 3x3 symmetric matrices over R?',
        options: [
          { label: 'A', text: '3' },
          { label: 'B', text: '6' },
          { label: 'C', text: '9' },
          { label: 'D', text: '4' }
        ],
        correctAnswer: 'B',
        marks: 1,
        order: 1
      },
      {
        testId: tests[0]._id,
        questionText: 'Let A be a 3x3 matrix with eigenvalues 1, 2, and 3. What is the determinant of A?',
        options: [
          { label: 'A', text: '6' },
          { label: 'B', text: '5' },
          { label: 'C', text: '14' },
          { label: 'D', text: '1' }
        ],
        correctAnswer: 'A',
        marks: 1,
        order: 2
      },
      {
        testId: tests[0]._id,
        questionText: 'Which of the following functions is nowhere differentiable on R?',
        options: [
          { label: 'A', text: 'f(x) = |x|' },
          { label: 'B', text: 'f(x) = sin(x)' },
          { label: 'C', text: 'Weierstrass function' },
          { label: 'D', text: 'f(x) = e^x' }
        ],
        correctAnswer: 'C',
        marks: 1,
        order: 3
      },
      {
        testId: tests[0]._id,
        questionText: 'If u and v are orthogonal vectors in an inner product space, then ||u + v||^2 equals:',
        options: [
          { label: 'A', text: '||u||^2 + ||v||^2' },
          { label: 'B', text: '||u||^2 - ||v||^2' },
          { label: 'C', text: '(||u|| + ||v||)^2' },
          { label: 'D', text: '||u|| * ||v||' }
        ],
        correctAnswer: 'A',
        marks: 1,
        order: 4
      },
      {
        testId: tests[0]._id,
        questionText: 'Find the limit of (sin x)/x as x approaches 0.',
        options: [
          { label: 'A', text: '0' },
          { label: 'B', text: 'Infinity' },
          { label: 'C', text: '1' },
          { label: 'D', text: 'Undefined' }
        ],
        correctAnswer: 'C',
        marks: 1,
        order: 5
      }
    );

    // Computer Science Questions
    questionsData.push(
      {
        testId: tests[1]._id,
        questionText: 'Which data structure is typically used to implement Breadth-First Search (BFS)?',
        options: [
          { label: 'A', text: 'Stack' },
          { label: 'B', text: 'Queue' },
          { label: 'C', text: 'Priority Queue' },
          { label: 'D', text: 'Hash Table' }
        ],
        correctAnswer: 'B',
        marks: 1,
        order: 1
      },
      {
        testId: tests[1]._id,
        questionText: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (e.g. AVL tree)?',
        options: [
          { label: 'A', text: 'O(1)' },
          { label: 'B', text: 'O(n)' },
          { label: 'C', text: 'O(log n)' },
          { label: 'D', text: 'O(n log n)' }
        ],
        correctAnswer: 'C',
        marks: 1,
        order: 2
      },
      {
        testId: tests[1]._id,
        questionText: 'Which scheduling policy can lead to starvation in operating systems?',
        options: [
          { label: 'A', text: 'Round Robin' },
          { label: 'B', text: 'First-Come, First-Served' },
          { label: 'C', text: 'Shortest Job First (non-preemptive)' },
          { label: 'D', text: 'Priority Scheduling' }
        ],
        correctAnswer: 'D',
        marks: 1,
        order: 3
      },
      {
        testId: tests[1]._id,
        questionText: 'What does ACID stand for in Database Management Systems?',
        options: [
          { label: 'A', text: 'Atomicity, Consistency, Isolation, Durability' },
          { label: 'B', text: 'Algorithm, Cache, Index, Directory' },
          { label: 'C', text: 'Access, Control, Integrity, Data' },
          { label: 'D', text: 'Automated, Columnar, Inline, Distributed' }
        ],
        correctAnswer: 'A',
        marks: 1,
        order: 4
      },
      {
        testId: tests[1]._id,
        questionText: 'A deadlock can be resolved by terminating a process. This is known as:',
        options: [
          { label: 'A', text: 'Deadlock avoidance' },
          { label: 'B', text: 'Deadlock recovery' },
          { label: 'C', text: 'Deadlock prevention' },
          { label: 'D', text: 'Mutual exclusion' }
        ],
        correctAnswer: 'B',
        marks: 1,
        order: 5
      }
    );

    // Aptitude Questions
    questionsData.push(
      {
        testId: tests[2]._id,
        questionText: 'Find the missing number in the sequence: 2, 6, 12, 20, 30, ?, 56.',
        options: [
          { label: 'A', text: '38' },
          { label: 'B', text: '40' },
          { label: 'C', text: '42' },
          { label: 'D', text: '44' }
        ],
        correctAnswer: 'C',
        marks: 1,
        order: 1
      },
      {
        testId: tests[2]._id,
        questionText: 'A train 120m long passes a telegraph post in 6 seconds. What is the speed of the train in km/h?',
        options: [
          { label: 'A', text: '72 km/h' },
          { label: 'B', text: '60 km/h' },
          { label: 'C', text: '80 km/h' },
          { label: 'D', text: '90 km/h' }
        ],
        correctAnswer: 'A',
        marks: 1,
        order: 2
      },
      {
        testId: tests[2]._id,
        questionText: 'If A is B\'s sister, C is B\'s mother, D is C\'s father, and E is D\'s mother. Then how is A related to D?',
        options: [
          { label: 'A', text: 'Grandmother' },
          { label: 'B', text: 'Grandfather' },
          { label: 'C', text: 'Daughter' },
          { label: 'D', text: 'Granddaughter' }
        ],
        correctAnswer: 'D',
        marks: 1,
        order: 3
      },
      {
        testId: tests[2]._id,
        questionText: 'A sum of money doubles itself in 10 years at simple interest. What is the annual interest rate?',
        options: [
          { label: 'A', text: '5%' },
          { label: 'B', text: '10%' },
          { label: 'C', text: '12%' },
          { label: 'D', text: '15%' }
        ],
        correctAnswer: 'B',
        marks: 1,
        order: 4
      },
      {
        testId: tests[2]._id,
        questionText: 'Six years ago, the ratio of the ages of Kunal and Sagar was 6:5. Four years hence, the ratio of their ages will be 11:10. What is Sagar\'s age at present?',
        options: [
          { label: 'A', text: '16 years' },
          { label: 'B', text: '18 years' },
          { label: 'C', text: '20 years' },
          { label: 'D', text: '22 years' }
        ],
        correctAnswer: 'A',
        marks: 1,
        order: 5
      }
    );

    const questions = await Question.insertMany(questionsData);
    console.log(`Successfully seeded ${questions.length} Questions.`);

    // 7. Seed Sample Results (Omitted to keep platform submissions directory clean of fake records)
    console.log('Skipping pre-computed Results seeding to maintain clean original platform submissions.');

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Credentials Summary:');
    console.log('-------------------');
    console.log('ADMINS:');
    console.log('  1. admin@gmail.com          | admin123');
    console.log('  2. alan.turing@college.edu  | admin123');
    console.log('STUDENTS (Username is Email | Password is Roll Number):');
    console.log('  1. John Doe      | Email: john@gmail.com    | Password: CS23001');
    console.log('  2. Alice Smith   | Email: alice@gmail.com   | Password: CS23002');
    console.log('  3. Bob Johnson   | Email: bob@gmail.com     | Password: CS23003');
    console.log('  4. Emma Watson   | Email: emma@gmail.com    | Password: CS23004');
    console.log('  5. Charlie Brown | Email: charlie@gmail.com | Password: CS23005');
    console.log('  6. Diana Prince  | Email: diana@gmail.com   | Password: IT23001');
    console.log('  7. Clark Kent    | Email: clark@gmail.com   | Password: IT23002');
    console.log('  8. Bruce Wayne   | Email: bruce@gmail.com   | Password: EC23001');
    console.log('  9. Peter Parker  | Email: peter@gmail.com   | Password: EC23002');
    console.log('  10. Tony Stark   | Email: tony@gmail.com    | Password: CS24001');
    console.log('======================================================\n');

    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Seeding process crashed:', error);
    process.exit(1);
  }
};

seedDatabase();
