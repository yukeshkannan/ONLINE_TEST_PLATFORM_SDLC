# 📋 Master Manual Test Cases & QA Checklist
## Online Test Platform — SDLC & College Academic Assessment Engine

> **Document Version:** 1.0.0  
> **Target System:** Online Test Platform (Dual-Portal: College Assessment & SDLC Institute Engine)  
> **Author:** QA & Engineering Team  
> **Status:** Ready for Execution  

---

## 📌 Executive Summary & Test Strategy

This document provides a comprehensive end-to-end manual testing specification for the **Online Test Platform**. It is structured to guide manual testers and QA engineers through all functional, non-functional, security, and edge-case scenarios across both Student and Admin/Faculty workflows.

### 🧪 Test Scope & Module Index

| Module ID | Module Title | Primary Focus Areas |
| :--- | :--- | :--- |
| **MOD-01** | Public Pages & Navigation | Landing Page, About Us, Contact Us form, Header, Footer, Transitions |
| **MOD-02** | Student Authentication & Session | Dual Portal (College vs SDLC), Rate Limiting, Invalid Credentials, Token Persistence |
| **MOD-03** | Student Dashboards | College & SDLC Dashboards, Test Cards, Eligibility Filters, History |
| **MOD-04** | Live Exam Engine & Proctoring | Fullscreen Protocol, Tab-switch Lock, 50% Time Lock, Timer Expiry, Auto-submit |
| **MOD-05** | Student Scorecard & Result Review | Instant Score Calculation, Pass/Fail, Accuracy %, Detailed Answer Review |
| **MOD-06** | Admin & Faculty Authentication | Admin Login, Role Hierarchy, Forgot Password with OTP Flow |
| **MOD-07** | Admin Overview & Analytics | KPI Tiles, Recent Submissions stream, Real-time status badges |
| **MOD-08** | Test Creation & Scheduling | College vs SDLC Targeting, 12-hr Time Picker, Clone, Edit, Delete |
| **MOD-09** | Question Bank & Bulk Parsers | Manual Question Form, Notepad/Text Parser, PDF Question Parser |
| **MOD-10** | Student Management | Single Add, CSV Bulk Upload, Duplicate Validation, Credentials Emailing |
| **MOD-11** | Faculty & User Management | Admin / Trainer Role assignment, Add User, Self-delete protection |
| **MOD-12** | Department, Center & Track Config | College Depts, SDLC Centers (Karur, CBE, etc.), Batch Tracks |
| **MOD-13** | Proctoring & Violation Logs | Real-time Violation logging, IP/Device metadata, Auto-submit tags |
| **MOD-14** | Results, Retakes & Excel Export | Submissions vs Pending, Scorecard Inspector, Attempt Reset, Multi-sheet Excel |
| **MOD-15** | Security, Session & Network Resilience | Token expiry, Page refresh recovery, URL tampering, Mobile UI |

---

## ⚙️ Test Environment & Pre-requisite Data

Before starting execution, ensure the following test accounts and data are seeded/created:

### 1. User Accounts
* **Super Admin:** `admin@nsn.edu` / `Admin@123`
* **Trainer / Faculty:** `trainer@nsn.edu` / `Trainer@123`
* **College Student 1:** Roll No: `21CS001`, Dept: `CSE`, Year: `3rd Year`, Password: `Password@123`
* **College Student 2:** Roll No: `21EC001`, Dept: `ECE`, Year: `2nd Year`, Password: `Password@123`
* **SDLC Student 1:** Enrollment ID: `SDLC-KRR-001`, Center: `Karur`, Track: `Web Design`, Password: `Password@123`
* **SDLC Student 2:** Enrollment ID: `SDLC-CBE-002`, Center: `Coimbatore`, Track: `Full Stack`, Password: `Password@123`

### 2. Test Data
* 1 Active College Assessment (Assigned to CSE 3rd Year)
* 1 Active SDLC Assessment (Assigned to Karur - Web Design)
* 1 Upcoming / Scheduled Assessment (Future start date)
* 1 Expired / Ended Assessment (Past end date)
* Sample CSV files for Bulk Student Import
* Sample `.txt` and `.pdf` files for Bulk Question Import

---

# 📝 Detailed Test Cases

---

## 🔹 Module 1: Public Pages & General Navigation

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_PUB_01** | Landing Page Load & Hero Section | Browser open | 1. Navigate to `/`<br>2. Check Hero section, CTA buttons ("Student Portal", "Faculty Portal"). | Page loads smoothly, animations display cleanly, branding logo visible. | High | [ ] Pass / [ ] Fail |
| **TC_PUB_02** | Navigation Links | On Landing page | 1. Click "About", "Contact", "Login" in Navbar.<br>2. Click Footer links. | All links route to correct paths (`/about`, `/contact`, `/login`) without 404. | Medium | [ ] Pass / [ ] Fail |
| **TC_PUB_03** | Contact Form Submission (Valid Data) | On `/contact` | 1. Fill Name, Email, Phone, Subject, and Message.<br>2. Click "Send Message". | Success toast appears, form clears, message saved to DB/controller. | High | [ ] Pass / [ ] Fail |
| **TC_PUB_04** | Contact Form Validation (Empty & Invalid) | On `/contact` | 1. Leave fields empty & click submit.<br>2. Enter invalid email format (e.g., `test@`). | HTML5 / custom validation errors display, prevents submission. | Medium | [ ] Pass / [ ] Fail |
| **TC_PUB_05** | Global Transition Loader | On any public page | 1. Navigate between routes (e.g., `/` to `/login`). | `PremiumLoader` / `ClockLoader` overlay renders smoothly without flicker. | Low | [ ] Pass / [ ] Fail |

---

## 🔹 Module 2: Student Authentication & Portal Selection

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_STU_AUTH_01** | College Student Login (Valid Credentials) | Student registered in DB | 1. Navigate to `/login`<br>2. Select "College Student" tab.<br>3. Enter Roll Number and Password.<br>4. Click Login. | Login successful, JWT token saved, redirects to `/student/dashboard`. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_AUTH_02** | SDLC Institute Student Login (Valid Credentials) | SDLC student registered | 1. Select "SDLC Institute" tab.<br>2. Enter Enrollment ID and Password.<br>3. Click Login. | Authenticated successfully, redirected to SDLC student portal. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_AUTH_03** | Invalid Student Credentials | On `/login` | 1. Enter wrong Roll No or wrong Password.<br>2. Click Login. | Error toast: "Invalid credentials" displayed. No redirect. | High | [ ] Pass / [ ] Fail |
| **TC_STU_AUTH_04** | Auth Rate Limiting Protection | Backend running | 1. Attempt rapid incorrect logins 6+ times within a minute. | Rate limiter triggers: "Too many login attempts, please try again later". | High | [ ] Pass / [ ] Fail |
| **TC_STU_AUTH_05** | Direct URL Protection without Login | Logged out | 1. Enter `http://localhost:5173/student/dashboard` directly in address bar. | System blocks access and immediately redirects to `/login`. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_AUTH_06** | Student Logout Flow | Student logged in | 1. Click Student Profile -> "Logout". | Session destroyed, token cleared from storage, redirected to `/`. | High | [ ] Pass / [ ] Fail |

---

## 🔹 Module 3: Student Dashboards (College & SDLC)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_DASH_01** | Student Profile Info Verification | Student logged in | 1. Check top banner profile card. | Correct Student Name, Roll No / Enrollment ID, Dept / Track displayed. | High | [ ] Pass / [ ] Fail |
| **TC_DASH_02** | Target Assessment Filtering | Tests created in Admin | 1. Verify test list on dashboard. | Only tests assigned to student's Dept & Year (or SDLC Center & Batch) appear. | Critical | [ ] Pass / [ ] Fail |
| **TC_DASH_03** | Test Status Badges (Active, Upcoming, Ended) | Tests in diff time windows | 1. Check test card statuses. | Current tests show "Active", future show "Upcoming", passed show "Ended". | High | [ ] Pass / [ ] Fail |
| **TC_DASH_04** | Prevent Starting Inactive / Ended Tests | Student logged in | 1. Locate an "Upcoming" or "Ended" test.<br>2. Try clicking "Start Test". | "Start Test" button is disabled or hidden with explanatory message. | Critical | [ ] Pass / [ ] Fail |
| **TC_DASH_05** | Completed Test Retake Block | Test already submitted | 1. Look at an already submitted test. | Shows "Completed" with "View Result" button instead of "Start Test". | Critical | [ ] Pass / [ ] Fail |

---

## 🔹 Module 4: Live Exam Engine & Anti-Cheating Proctoring (🔥 Critical)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_EXAM_01** | Pre-Exam Clearance Gateway | Click "Start Test" on active test | 1. Verify clearance modal displays student photo/initials, details, and rules.<br>2. Click "Authorize Clearance & Start Test". | Browser enters Fullscreen mode; exam questions load securely. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_02** | Question Shuffling & Order Persistence | Student starts exam | 1. Note Question #1.<br>2. Refresh page during exam. | Question order is randomized and matches the cached order in `localStorage`. | High | [ ] Pass / [ ] Fail |
| **TC_EXAM_03** | Question Navigator & State Colors | Inside exam | 1. Answer Q1 -> check Grid.<br>2. Flag Q2 -> check Grid.<br>3. Leave Q3 unanswered. | Q1 turns Green (Answered), Q2 turns Red/Amber (Flagged), Q3 remains Gray/Slate. | High | [ ] Pass / [ ] Fail |
| **TC_EXAM_04** | Option Selection & Clear Selection | Inside exam | 1. Select Option 'B'.<br>2. Click "Clear Selection". | Option 'B' clears; Navigator grid updates Q state from Answered to Unanswered. | High | [ ] Pass / [ ] Fail |
| **TC_EXAM_05** | Question Flag / Bookmark Toggle | Inside exam | 1. Click "Flag for Review".<br>2. Click "Unflag Question". | State toggles properly in UI and navigator grid without losing chosen answer. | Medium | [ ] Pass / [ ] Fail |
| **TC_EXAM_06** | Fullscreen Exit Violation & 5s Countdown | Inside active exam | 1. Press `ESC` or exit fullscreen mode. | Red fullscreen exit modal appears with 5-second countdown timer. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_07** | Fullscreen Recovery within 5 Seconds | Fullscreen modal active | 1. Click "Return to Fullscreen Mode Now" before 5s expires. | Countdown clears, fullscreen re-engaged, exam continues normally. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_08** | Fullscreen Violation Auto-Submit | Fullscreen modal active | 1. Exit fullscreen and do not return for 5 seconds. | Exam auto-submits with type `security_violation`. Logged in `/violations/log`. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_09** | Tab Switch Warning 1 & 2 | Inside exam | 1. Switch to another browser tab or minimize window.<br>2. Return to exam. | Warning toast: "Tab switch detected (1/3)". Switch again: "(2/3)". | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_10** | Tab Switch Limit Reached (3/3 Auto-Submit) | Inside exam | 1. Switch tab 3rd time and return. | Error toast: "Max tab switches reached". Exam auto-submits immediately. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_11** | Live Countdown Timer Expiry | Exam timer reaches 00:00 | 1. Let the timer count down to zero. | Auto-submits responses with `timer_expired`. Redirects to Results. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_12** | 50% Minimum Duration Submit Lock | Exam just started | 1. Try to submit exam in the first 5 minutes (before 50% time elapsed). | Submit button says "Submit Locked (mm:ss)" and is completely disabled. | High | [ ] Pass / [ ] Fail |
| **TC_EXAM_13** | Manual Submit Confirmation Modal | 50% time elapsed | 1. Click "Submit Assessment".<br>2. Check summary modal. | Modal shows exact count: "Answered X out of Y questions". Has "Go Back" & "Yes, Submit". | High | [ ] Pass / [ ] Fail |
| **TC_EXAM_14** | Browser Refresh / Recovery during Exam | Exam in progress | 1. Select answers for Q1, Q2.<br>2. Press `F5` / Refresh. | State restored from `localStorage`, selected answers and timer remain accurate. | Critical | [ ] Pass / [ ] Fail |
| **TC_EXAM_15** | Browser Tab Close / `beforeunload` Guard | Exam in progress | 1. Try closing tab or browser window. | Browser prompt: "An active assessment is in progress. Leaving will auto-submit exam." | High | [ ] Pass / [ ] Fail |

---

## 🔹 Module 5: Student Scorecard & Detailed Review

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_RES_01** | Post-Exam Score Calculation | Exam submitted | 1. View results screen. | Marks scored, total marks, percentage (%), and Pass/Fail badge match criteria. | Critical | [ ] Pass / [ ] Fail |
| **TC_RES_02** | Time Taken & Accuracy Metrics | On result screen | 1. Check metric cards. | Time spent formatted cleanly (e.g., `12m 30s`), Accuracy % calculated correctly. | High | [ ] Pass / [ ] Fail |
| **TC_RES_03** | Question-by-Question Breakdown | On result screen | 1. Scroll through question list. | Shows Student Answer, Correct Answer (Green check), and Incorrect (Red cross). | High | [ ] Pass / [ ] Fail |
| **TC_RES_04** | Unattempted Question Indicator | Unattempted questions exist | 1. Locate unanswered questions in results. | Marked with "Unattempted" status badge. | Medium | [ ] Pass / [ ] Fail |
| **TC_RES_05** | Question Explanations Display | Explanation added in test | 1. Inspect reviewed questions. | Explanation box renders if provided by faculty; hidden if empty. | Medium | [ ] Pass / [ ] Fail |
| **TC_RES_06** | Return to Dashboard | On result screen | 1. Click "Back to Dashboard". | Redirects to Student Dashboard; test card now shows "Completed". | High | [ ] Pass / [ ] Fail |

---

## 🔹 Module 6: Admin & Faculty Authentication

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ADM_AUTH_01** | Admin / Trainer Login (Valid) | Admin in DB | 1. Navigate to `/admin/login`<br>2. Enter Email and Password.<br>3. Click "Sign In". | Authenticated, JWT token saved, redirects to `/admin/dashboard`. | Critical | [ ] Pass / [ ] Fail |
| **TC_ADM_AUTH_02** | Admin Invalid Password | On `/admin/login` | 1. Enter correct email, wrong password. | Error toast: "Invalid credentials" displayed. | High | [ ] Pass / [ ] Fail |
| **TC_ADM_AUTH_03** | Admin Forgot Password - Request OTP | On `/admin/login` | 1. Click "Forgot Password?".<br>2. Enter registered admin email.<br>3. Click "Send OTP". | OTP generated & sent to email; step moves to "Verify OTP". | High | [ ] Pass / [ ] Fail |
| **TC_ADM_AUTH_04** | Admin Verify OTP & Reset Password | OTP received | 1. Enter 6-digit OTP.<br>2. Enter New Password & Confirm.<br>3. Click "Reset Password". | Password updated successfully, can log in with new password. | High | [ ] Pass / [ ] Fail |
| **TC_ADM_AUTH_05** | Admin Portal Role Protection | Student logged in | 1. Try accessing `/admin/dashboard` with student account. | Access blocked, unauthorized redirect to `/login`. | Critical | [ ] Pass / [ ] Fail |

---

## 🔹 Module 7: Admin Dashboard Overview & Analytics

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ADM_DASH_01** | Stat Counters Integrity | Tests & Students in DB | 1. Open `/admin/dashboard`.<br>2. Check cards: Total Students, Active Tests, Submissions, Violations. | Numbers match DB records accurately. | High | [ ] Pass / [ ] Fail |
| **TC_ADM_DASH_02** | College vs SDLC Test Split Counters | Mixed tests present | 1. Check College Tests count vs SDLC Institute Tests count. | Accurate count based on category mode and assigned batches. | Medium | [ ] Pass / [ ] Fail |
| **TC_ADM_DASH_03** | Recent Submissions Stream | Candidates submitted | 1. Check Recent Submissions widget. | Displays candidate name, test title, score, and submission timestamp. | High | [ ] Pass / [ ] Fail |
| **TC_ADM_DASH_04** | Live Test Status Badges | Tests with diff schedules | 1. Verify status chips (Active, Draft, Ended). | Computed dynamically based on `endTime` and server clock. | High | [ ] Pass / [ ] Fail |

---

## 🔹 Module 8: Test Management (Create, Edit, Clone, Delete)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_TEST_01** | Create College Assessment | Admin logged in | 1. Go to Tests -> "Create New Test".<br>2. Choose "College Assessment".<br>3. Fill Title, Subject, Duration (mins), Pass Mark.<br>4. Select Dept (e.g. CSE) and Year (e.g. 3rd Year).<br>5. Set Schedule Date & 12-hr Time.<br>6. Click "Create Test". | Test created successfully, appears in Test list under College tab. | Critical | [ ] Pass / [ ] Fail |
| **TC_TEST_02** | Create SDLC Institute Assessment | Admin logged in | 1. Choose "SDLC Institute Assessment".<br>2. Select Center (e.g. Karur) & Batch (e.g. Web Design).<br>3. Set duration & schedule.<br>4. Save Test. | Test created and target assigned to SDLC center/batch. | Critical | [ ] Pass / [ ] Fail |
| **TC_TEST_03** | Schedule Date/Time Validation | In Create Test form | 1. Set End Date/Time earlier than Start Date/Time.<br>2. Click Save. | Error toast: "End time must be after Start time". Form blocks save. | High | [ ] Pass / [ ] Fail |
| **TC_TEST_04** | Edit Existing Test Details | Test created | 1. Click "Edit" on a test card.<br>2. Change duration or title.<br>3. Save changes. | Test updated in DB and reflected in student dashboards. | High | [ ] Pass / [ ] Fail |
| **TC_TEST_05** | Clone / Duplicate Test | Test exists | 1. Click "Clone / Duplicate" icon on test. | New test created with title `Copy of [Original Title]` and same questions. | Medium | [ ] Pass / [ ] Fail |
| **TC_TEST_06** | Delete Test with Confirmation | Test exists | 1. Click "Delete Test".<br>2. Verify confirmation dialog.<br>3. Click "Confirm Delete". | Test and associated questions deleted; removed from UI list. | High | [ ] Pass / [ ] Fail |
| **TC_TEST_07** | Test Search and Filter | Multiple tests exist | 1. Type keywords in search bar.<br>2. Filter by "College" vs "SDLC" and "Active" vs "Draft". | List filters instantly and pagination adjusts accordingly. | Medium | [ ] Pass / [ ] Fail |

---

## 🔹 Module 9: Question Bank & Bulk Import Parsers

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_Q_01** | Add Single Question Manually | Test created | 1. Open test -> "Add Questions".<br>2. Enter Question text, Options A, B, C, D.<br>3. Select Correct Option dropdown (e.g. B).<br>4. Enter Marks & Explanation.<br>5. Click "Save Question". | Question added to test; displayed in Question table. | Critical | [ ] Pass / [ ] Fail |
| **TC_Q_02** | Edit / Delete Existing Question | Questions exist in test | 1. Click Edit icon -> change option text -> Save.<br>2. Click Delete icon -> confirm. | Edited question updates; deleted question removes cleanly. | High | [ ] Pass / [ ] Fail |
| **TC_Q_03** | Bulk Import via Notepad / Formatted Text | In Test Questions tab | 1. Click "Bulk Import Questions".<br>2. Paste formatted text (e.g., `1. What is React? A) Lib B) DB Ans: A`).<br>3. Click "Parse & Preview". | Parser identifies all questions, options, and correct keys into table. | Critical | [ ] Pass / [ ] Fail |
| **TC_Q_04** | Bulk Import via PDF Upload | PDF question bank file | 1. In Bulk Import Modal, upload `.pdf` file.<br>2. Click "Extract Questions". | `pdfParser` extracts text, splits MCQs, and previews for confirmation. | Critical | [ ] Pass / [ ] Fail |
| **TC_Q_05** | Bulk Question Validation & Commit | Parsed questions table | 1. Review previewed questions.<br>2. Fix any missing correct answer tags.<br>3. Click "Import All Questions". | All parsed questions inserted to DB and linked to test. | Critical | [ ] Pass / [ ] Fail |

---

## 🔹 Module 10: Student Management & Batch Operations

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_STU_MGT_01** | Add Single College Student | Admin logged in | 1. Go to Students -> "Add Student".<br>2. Choose "College Student".<br>3. Enter Name, Roll No, Email, Dept, Year, Password.<br>4. Click "Add Student". | Student created and listed under College Students tab. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_02** | Add Single SDLC Student | Admin logged in | 1. Choose "SDLC Student".<br>2. Enter Name, Enrollment ID, Center, Batch Track.<br>3. Click "Add Student". | Student created and listed under SDLC Students tab. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_03** | Duplicate Roll No / Enrollment ID Check | Student exists | 1. Try adding a new student with an existing Roll No / Enrollment ID. | Error toast: "Student with this Roll Number / Enrollment ID already exists". | High | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_04** | Bulk Student Import via CSV | Prepared CSV file | 1. Click "Bulk Import Students".<br>2. Download sample CSV template.<br>3. Upload valid CSV file with student rows.<br>4. Click "Process Import". | All valid students created; summary of added count displayed. | Critical | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_05** | Edit & Delete Student | Student in list | 1. Click Edit -> modify phone or dept -> Save.<br>2. Click Delete -> confirm. | Student details update; deleted student cannot log in. | High | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_06** | Send Credentials Email (Single Student) | Student has email | 1. Click "Send Credentials" button on student row. | System emails login credentials (Roll No/Enrollment ID & Password). | High | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_07** | Send Credentials Email (Bulk to All) | Multiple students | 1. Click "Send Credentials to All Students".<br>2. Confirm dispatch. | Emails queued and dispatched to all registered active candidates. | High | [ ] Pass / [ ] Fail |
| **TC_STU_MGT_08** | Export Students to CSV / Excel | Students exist | 1. Click "Export Students" button. | Excel/CSV file downloads with student details. | Medium | [ ] Pass / [ ] Fail |

---

## 🔹 Module 11: Faculty & User Management

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_USR_01** | Add Faculty / Trainer User | Admin logged in | 1. Go to "Users" -> "Add User".<br>2. Fill Name, Email, Password, Role (Admin/Trainer).<br>3. Click Save. | User created and can log in to `/admin/login`. | High | [ ] Pass / [ ] Fail |
| **TC_USR_02** | Trainer Role Permission Check | Trainer user | 1. Log in as Trainer.<br>2. Check available tabs and actions. | Restricted from deleting superadmins or critical platform configs. | High | [ ] Pass / [ ] Fail |
| **TC_USR_03** | Prevent Self-Deletion | Logged in as Admin | 1. Locate current logged-in user in User List.<br>2. Check Delete button. | Delete button disabled or hidden for current logged-in session. | Medium | [ ] Pass / [ ] Fail |

---

## 🔹 Module 12: Department, Center & Track Configuration

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_CRS_01** | Add New College Department | On `/admin/courses` | 1. Under Departments, click "Add Department".<br>2. Enter Code (e.g. `AIDS`), Name (e.g. `Artificial Intelligence & Data Science`).<br>3. Save. | Dept appears in test assignment & student registration dropdowns. | High | [ ] Pass / [ ] Fail |
| **TC_CRS_02** | Add New SDLC Center / Branch | On `/admin/courses` | 1. Under Centers, click "Add Center".<br>2. Enter Center Name (e.g. `Trichy`).<br>3. Save. | New center listed and usable in SDLC student portal & tests. | High | [ ] Pass / [ ] Fail |
| **TC_CRS_03** | Add New Batch Track | On `/admin/courses` | 1. Under Tracks, click "Add Track".<br>2. Enter Track Name (e.g. `Cybersecurity`).<br>3. Save. | Track available in SDLC batch filters. | High | [ ] Pass / [ ] Fail |

---

## 🔹 Module 13: Proctoring & Integrity Violation Logs

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_PROC_01** | Real-Time Violation Log Generation | Student triggers tab switch / exit | 1. Check `/admin/proctoring` table. | Log entry appears with Student Name, Roll No, Test Name, Violation Type (`tab_switch` / `fullscreen_exit`), and Timestamp. | Critical | [ ] Pass / [ ] Fail |
| **TC_PROC_02** | Auto-Submit Flag in Logs | Auto-submitted candidate | 1. Inspect violations for student who triggered 3 tab switches. | `Auto-submitted: TRUE` badge appears in red. | High | [ ] Pass / [ ] Fail |
| **TC_PROC_03** | Filter Violation Logs | Multiple logs exist | 1. Filter by Test or Violation Type.<br>2. Search student name. | Table filters accurately to matching violation events. | Medium | [ ] Pass / [ ] Fail |

---

## 🔹 Module 14: Results, Retakes & Excel Report Export

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_REP_01** | View Test Submissions List | Test with submissions | 1. Click "View Results" on a test.<br>2. Check Submissions Tab vs Pending Tab. | Submissions list displays candidate name, score, %, Pass/Fail status, time taken. | Critical | [ ] Pass / [ ] Fail |
| **TC_REP_02** | Pending / Not Attempted Student List | Eligible students exist | 1. Switch to "Pending Students" tab. | Shows all eligible candidates who have not yet submitted the exam. | High | [ ] Pass / [ ] Fail |
| **TC_REP_03** | View Student Candidate Scorecard | On Results page | 1. Click "View Scorecard / Eye Icon" on a student row. | Modal opens showing exact student answer sheet and correct answers. | High | [ ] Pass / [ ] Fail |
| **TC_REP_04** | Reset Assessment Attempt (Grant Retake) | Candidate submitted | 1. Click "Reset Attempt / Retake" button on candidate row.<br>2. Confirm modal. | Previous result deleted; candidate can now log in and retake the test. | Critical | [ ] Pass / [ ] Fail |
| **TC_REP_05** | Export Multi-Sheet Excel Workbook | Test submissions exist | 1. Click "Download Excel Report" button. | Excel `.xlsx` file downloads with formatted summary, candidate scores, and question analysis. | Critical | [ ] Pass / [ ] Fail |

---

## 🔹 Module 15: Non-Functional, Security & Cross-Device Testing

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_SEC_01** | JWT Token Expiry & Auto-Logout | Expired token | 1. Let session expire or invalidate token.<br>2. Try performing an action. | System catches 401, clears invalid token, and redirects to login. | High | [ ] Pass / [ ] Fail |
| **TC_SEC_02** | Network Interruption during Test | Test in progress | 1. Disconnect Wi-Fi for 15 seconds while answering.<br>2. Reconnect Wi-Fi and submit. | Local answers preserved; submission succeeds upon network reconnection. | Critical | [ ] Pass / [ ] Fail |
| **TC_SEC_03** | Cross-Browser Compatibility | Chrome, Edge, Firefox, Safari | 1. Run student exam flow in Chrome, Edge, and Firefox. | Fullscreen APIs, timer, question rendering, and buttons work identically. | High | [ ] Pass / [ ] Fail |
| **TC_SEC_04** | Responsive Mobile / Tablet Layout | Smartphone / Tablet | 1. Open Student Dashboard & Test Engine on mobile screen (375px - 768px). | Question drawer opens smoothly via grid button; navigation buttons remain accessible. | High | [ ] Pass / [ ] Fail |

---

## 🐞 Defect Logging Template for Manual Testers

When a test case fails, copy and log the defect using this standard format:

```markdown
### 🐛 Bug Report: [Short Description of Issue]

- **Defect ID:** BUG-001
- **Associated Test Case ID:** TC_EXAM_06
- **Severity:** Blocker / Critical / Major / Minor
- **Environment:** Chrome 124 / Windows 11 / Localhost:5173
- **User Role:** Student (Roll No: 21CS001)

#### Steps to Reproduce:
1. Log in as Student
2. Launch Test "Web Development Assessment"
3. Enter Fullscreen Mode
4. Press ESC key to trigger fullscreen exit

#### Expected Result:
A 5-second countdown warning modal should display prompting return to fullscreen.

#### Actual Result:
Screen turns blank / countdown freezes at 5s.

#### Attachments / Screenshots / Console Logs:
[Attach screenshot or console error traceback]
```

---

## ✅ QA Sign-Off Checklist

- [ ] All Critical (P0) Test Cases Passed
- [ ] All High (P1) Test Cases Passed
- [ ] No Open Blocker or Critical Defects
- [ ] Anti-Cheating & Auto-Submission verified on live test runs
- [ ] Multi-Sheet Excel Reports verified for data accuracy
- [ ] Responsive Layouts tested on Mobile, Tablet & Desktop

**Sign-off Date:** `____ / ____ / ________`  
**QA Lead Signature:** `______________________`
