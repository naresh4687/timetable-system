import User from '../models/User.js';

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/users
 * @access  Admin
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, subjects, handledSemesters } = req.body;

    // Admin can create manager and staff; not another admin
    const allowedRoles = ['manager', 'staff', 'student'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Allowed: manager, staff, student.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password, role, department, subjects, handledSemesters: handledSemesters || [] });

    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, subjects, isActive, handledSemesters } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, subjects, isActive, handledSemesters },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff members
 * @route   GET /api/users/staff
 * @access  Admin, Manager
 */
export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true }).sort({ name: 1 });
    res.json({ staff });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get count of staff members
 * @route   GET /api/users/staff-count
 * @access  Admin
 */
export const getStaffCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments({ role: 'staff' });
    console.log('Staff Count:', count);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk delete users
 * @route   POST /api/users/bulk-delete
 * @access  Admin
 */
export const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide user IDs to delete.' });
    }

    // Prevent admin from deleting themselves
    if (ids.includes(req.user._id.toString())) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `${result.deletedCount} user(s) deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's own profile
 * @route   GET /api/users/profile
 * @access  All authenticated roles
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user's own profile (name & department only)
 * @route   PUT /api/users/profile
 * @access  All authenticated roles
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, department, dob } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ message: 'Department is required.' });
    }

    const updateFields = { name: name.trim(), department: department.trim() };
    if (dob) updateFields.dob = dob;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user profile image
 * @route   POST /api/users/upload-image
 * @access  All authenticated roles
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided.' });
    }

    // Convert local system path backslashes to forward slashes for URLs
    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image updated successfully',
      profileImage: imagePath,
      user
    });
  } catch (error) {
    next(error);
  }
};
