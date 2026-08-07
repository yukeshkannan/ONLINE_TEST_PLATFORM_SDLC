import Department from '../models/Department.js';
import BatchTrack from '../models/BatchTrack.js';
import Center from '../models/Center.js';

const DEFAULT_DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', description: 'Department of Computer Science and Software Systems' },
  { code: 'IT', name: 'Information Technology', description: 'Department of Information Technology and Network Systems' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', description: 'Department of AI, Machine Learning and Analytics' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', description: 'Department of Electronics and Signals' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', description: 'Department of Electrical Engineering and Power Systems' },
  { code: 'MECH', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering', description: 'Department of Civil and Structural Engineering' }
];

const DEFAULT_CENTERS = [
  { name: 'Karur', code: 'KRR', location: 'Karur District Branch' },
  { name: 'Coimbatore', code: 'CBE', location: 'Coimbatore Tech Hub Branch' },
  { name: 'Namakkal', code: 'NKL', location: 'Namakkal District Branch' },
  { name: 'Dindigul', code: 'DGL', location: 'Dindigul District Branch' }
];

const DEFAULT_BATCHES = [
  { name: 'Full Stack Web Dev (MERN)', code: 'FS-WEB', category: 'institute', description: 'Complete MERN Stack Web Development' },
  { name: 'AutoCAD & Mechanical CAD', code: 'CAD-MECH', category: 'institute', description: '2D & 3D Mechanical Computer Aided Design' },
  { name: 'SolidWorks & 3D Modeling', code: 'SOLID-3D', category: 'institute', description: 'SolidWorks Industry Standard 3D Modeling' },
  { name: 'Python Data Science & AI', code: 'PY-DS', category: 'institute', description: 'Python Analytics, Machine Learning & AI' },
  { name: 'Embedded Systems & IoT', code: 'EMB-IOT', category: 'institute', description: 'Embedded Systems, Microcontrollers & IoT' }
];

// Optional Manual Reset Endpoint for Admin
export const resetDefaults = async (req, res, next) => {
  try {
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) await Department.insertMany(DEFAULT_DEPARTMENTS);

    const batchCount = await BatchTrack.countDocuments();
    if (batchCount === 0) await BatchTrack.insertMany(DEFAULT_BATCHES);

    const centerCount = await Center.countDocuments();
    if (centerCount === 0) await Center.insertMany(DEFAULT_CENTERS);

    res.status(200).json({ message: 'Catalog defaults restored.' });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find().sort({ code: 1 });
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
// BATCH / COURSE TRACK CONTROLLERS
// ==========================================

export const getBatches = async (req, res, next) => {
  try {
    const batches = await BatchTrack.find().sort({ name: 1 });
    res.status(200).json(batches);
  } catch (error) {
    next(error);
  }
};

const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createBatch = async (req, res, next) => {
  const { name, code, category, department, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Course/Track name is required.' });
  }

  try {
    const escapedName = escapeRegex(name.trim());
    const existing = await BatchTrack.findOne({ 
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') } 
    });
    if (existing) {
      return res.status(400).json({ message: `Course track '${name.trim()}' already exists in the catalog.` });
    }

    const newBatch = new BatchTrack({
      name: name.trim(),
      code: code ? code.toUpperCase().trim() : '',
      category: category === 'college' ? 'college' : 'institute',
      department: department ? department.trim() : 'All Departments',
      description: description ? description.trim() : ''
    });

    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Course track '${name.trim()}' already exists.` });
    }
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  const { id } = req.params;
  const { name, code, category, department, description, isActive } = req.body;

  try {
    const batch = await BatchTrack.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Course track not found.' });
    }

    if (name !== undefined) batch.name = name.trim();
    if (code !== undefined) batch.code = code.toUpperCase().trim();
    if (category !== undefined) batch.category = category === 'college' ? 'college' : 'institute';
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
      return res.status(404).json({ message: 'Course track not found.' });
    }
    res.status(200).json({ message: 'Course track deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DISTRICT BRANCH / CENTER CONTROLLERS
// ==========================================

export const getCenters = async (req, res, next) => {
  try {
    const centers = await Center.find().sort({ name: 1 });
    res.status(200).json(centers);
  } catch (error) {
    next(error);
  }
};

export const createCenter = async (req, res, next) => {
  const { name, code, location } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'Branch name and district code are required.' });
  }

  try {
    const cleanCode = code.toUpperCase().trim();
    const cleanName = name.trim();

    const existing = await Center.findOne({ $or: [{ name: cleanName }, { code: cleanCode }] });
    if (existing) {
      return res.status(400).json({ message: `Branch with name '${cleanName}' or code '${cleanCode}' already exists.` });
    }

    const newCenter = new Center({
      name: cleanName,
      code: cleanCode,
      location: location ? location.trim() : ''
    });

    const saved = await newCenter.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateCenter = async (req, res, next) => {
  const { id } = req.params;
  const { name, code, location, isActive } = req.body;

  try {
    const center = await Center.findById(id);
    if (!center) {
      return res.status(404).json({ message: 'District branch not found.' });
    }

    if (name !== undefined) center.name = name.trim();
    if (code !== undefined) center.code = code.toUpperCase().trim();
    if (location !== undefined) center.location = location.trim();
    if (isActive !== undefined) center.isActive = Boolean(isActive);

    const updated = await center.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCenter = async (req, res, next) => {
  const { id } = req.params;

  try {
    const center = await Center.findByIdAndDelete(id);
    if (!center) {
      return res.status(404).json({ message: 'District branch not found.' });
    }
    res.status(200).json({ message: 'District branch deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
