import Department from '../models/Department.js';
import BatchTrack from '../models/BatchTrack.js';
import Center from '../models/Center.js';

// Dynamic Cohort & Catalog Controller (100% DB-driven without hardcoded seeds)

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

// Attempt to drop legacy global name_1 index if present
BatchTrack.collection.dropIndex('name_1').catch(() => {});

const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createBatch = async (req, res, next) => {
  const { name, code, category, department, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Course/Track name is required.' });
  }

  try {
    const targetCategory = category === 'college' ? 'college' : 'institute';
    const targetDept = targetCategory === 'college' ? (department ? department.trim() : 'All Departments') : 'All Departments';
    const escapedName = escapeRegex(name.trim());

    // Check if course already exists in the same category & department
    const existing = await BatchTrack.findOne({
      category: targetCategory,
      department: targetDept,
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });
    if (existing) {
      return res.status(400).json({
        message: `Course track '${name.trim()}' already exists in ${targetCategory === 'college' ? `College (${targetDept})` : 'SDLC Institute'}.`
      });
    }

    const newBatch = new BatchTrack({
      name: name.trim(),
      code: code ? code.toUpperCase().trim() : '',
      category: targetCategory,
      department: targetDept,
      description: description ? description.trim() : ''
    });

    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Course track '${name.trim()}' already exists in this category.` });
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

    const targetCategory = category !== undefined ? (category === 'college' ? 'college' : 'institute') : batch.category;
    const targetDept = targetCategory === 'college' 
      ? (department !== undefined ? department.trim() : batch.department)
      : 'All Departments';
    const targetName = name !== undefined ? name.trim() : batch.name;

    if (name !== undefined || category !== undefined || department !== undefined) {
      const escapedName = escapeRegex(targetName);
      const duplicate = await BatchTrack.findOne({
        _id: { $ne: id },
        category: targetCategory,
        department: targetDept,
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
      });
      if (duplicate) {
        return res.status(400).json({
          message: `Course track '${targetName}' already exists in ${targetCategory === 'college' ? `College (${targetDept})` : 'SDLC Institute'}.`
        });
      }
    }

    if (name !== undefined) batch.name = targetName;
    if (code !== undefined) batch.code = code.toUpperCase().trim();
    if (category !== undefined) batch.category = targetCategory;
    if (department !== undefined) batch.department = targetDept;
    if (description !== undefined) batch.description = description.trim();
    if (isActive !== undefined) batch.isActive = Boolean(isActive);

    const updated = await batch.save();
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Course track with this name already exists in this category.` });
    }
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
