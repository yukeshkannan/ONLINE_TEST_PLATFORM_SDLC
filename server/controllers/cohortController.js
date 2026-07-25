import Department from '../models/Department.js';
import BatchTrack from '../models/BatchTrack.js';

const DEFAULT_DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', description: 'Department of Computer Science and Software Systems' },
  { code: 'IT', name: 'Information Technology', description: 'Department of Information Technology and Network Systems' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', description: 'Department of AI, Machine Learning and Analytics' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', description: 'Department of Electronics and Signals' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', description: 'Department of Electrical Engineering and Power Systems' },
  { code: 'MECH', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering', description: 'Department of Civil and Structural Engineering' }
];

const DEFAULT_BATCHES = [
  { name: 'Web Design', code: 'WEB', department: 'All Departments', description: 'Modern Responsive Frontend Web Development Track' },
  { name: 'UI/UX', code: 'UIUX', department: 'All Departments', description: 'User Experience & Interface Design Track' },
  { name: 'SolidWorks', code: 'CAD-SW', department: 'MECH', description: '3D Mechanical Computer-Aided Design Track' },
  { name: 'AutoCAD', code: 'CAD-AC', department: 'CIVIL', description: '2D & 3D Drafting and Modeling Track' },
  { name: 'Full Stack Java', code: 'FSWD', department: 'CSE', description: 'Java Enterprise Full Stack Development Track' },
  { name: 'Data Science & ML', code: 'DSML', department: 'AIDS', description: 'Data Analytics & Predictive Modeling Track' }
];

// ==========================================
// DEPARTMENT CONTROLLERS
// ==========================================

export const getDepartments = async (req, res, next) => {
  try {
    let depts = await Department.find().sort({ code: 1 });

    // Seed defaults if empty
    if (depts.length === 0) {
      await Department.insertMany(DEFAULT_DEPARTMENTS);
      depts = await Department.find().sort({ code: 1 });
    }

    res.status(200).json(depts);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  const { code, name, description } = req.body;

  if (!code || !name) {
    return res.status(400).json({ message: 'Department code and name are required.' });
  }

  try {
    const existing = await Department.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: `Department with code '${code.toUpperCase()}' already exists.` });
    }

    const newDept = new Department({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    const saved = await newDept.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  const { id } = req.params;
  const { code, name, description, isActive } = req.body;

  try {
    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    if (code !== undefined) dept.code = code.toUpperCase().trim();
    if (name !== undefined) dept.name = name.trim();
    if (description !== undefined) dept.description = description.trim();
    if (isActive !== undefined) dept.isActive = Boolean(isActive);

    const updated = await dept.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.status(200).json({ message: 'Department record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BATCH TRACK CONTROLLERS
// ==========================================

export const getBatches = async (req, res, next) => {
  try {
    let batches = await BatchTrack.find().sort({ name: 1 });

    // Seed defaults if empty
    if (batches.length === 0) {
      await BatchTrack.insertMany(DEFAULT_BATCHES);
      batches = await BatchTrack.find().sort({ name: 1 });
    }

    res.status(200).json(batches);
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  const { name, code, department, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Batch name is required.' });
  }

  try {
    const existing = await BatchTrack.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: `Batch track '${name.trim()}' already exists.` });
    }

    const newBatch = new BatchTrack({
      name: name.trim(),
      code: code ? code.toUpperCase().trim() : '',
      department: department ? department.trim() : 'All Departments',
      description: description ? description.trim() : ''
    });

    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  const { id } = req.params;
  const { name, code, department, description, isActive } = req.body;

  try {
    const batch = await BatchTrack.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch track not found.' });
    }

    if (name !== undefined) batch.name = name.trim();
    if (code !== undefined) batch.code = code.toUpperCase().trim();
    if (department !== undefined) batch.department = department.trim();
    if (description !== undefined) batch.description = description.trim();
    if (isActive !== undefined) batch.isActive = Boolean(isActive);

    const updated = await batch.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req, res, next) => {
  const { id } = req.params;

  try {
    const batch = await BatchTrack.findByIdAndDelete(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch track not found.' });
    }
    res.status(200).json({ message: 'Batch track record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
