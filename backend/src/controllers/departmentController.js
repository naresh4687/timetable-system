import Department from '../models/Department.js';

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Admin
 */
export const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists.' });
    }

    const department = await Department.create({ name: name.trim() });
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Authenticated (all roles need this for dropdowns)
 */
export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department name
 * @route   PUT /api/departments/:id
 * @access  Admin
 */
export const updateDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    // Check for duplicate
    const existing = await Department.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ message: 'A department with this name already exists.' });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!department) return res.status(404).json({ message: 'Department not found.' });
    res.json(department);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Admin
 */
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
