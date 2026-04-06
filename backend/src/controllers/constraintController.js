import Constraint from '../models/Constraint.js';

/**
 * @desc    Create a constraint
 * @route   POST /api/constraints
 * @access  Admin
 */
export const createConstraint = async (req, res, next) => {
  try {
    const { staffId, academicYear, semester, avoidDays, avoidSlots, avoidPeriods, maxHours } = req.body;

    // Check if constraint already exists for this staff in the given semester and year
    const existing = await Constraint.findOne({ staffId, academicYear, semester });
    if (existing) {
      return res.status(400).json({ message: 'Constraint already exists for this staff in the specified semester and year.' });
    }

    const constraint = await Constraint.create({
      staffId,
      academicYear,
      semester,
      avoidDays,
      avoidSlots,
      avoidPeriods,
      maxHours,
    });

    await constraint.populate('staffId', 'name email department');
    res.status(201).json({ message: 'Constraint created successfully', constraint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all constraints
 * @route   GET /api/constraints
 * @access  Admin, Manager
 */
export const getAllConstraints = async (req, res, next) => {
  try {
    const constraints = await Constraint.find().populate('staffId', 'name email department');
    res.json({ constraints });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get constraints by staff ID
 * @route   GET /api/constraints/staff/:staffId
 * @access  Admin, Manager
 */
export const getConstraintsByStaffId = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const constraints = await Constraint.find({ staffId }).populate('staffId', 'name email department');
    res.json({ constraints });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a constraint
 * @route   PUT /api/constraints/:id
 * @access  Admin
 */
export const updateConstraint = async (req, res, next) => {
  try {
    const { academicYear, semester, avoidDays, avoidSlots, avoidPeriods, maxHours } = req.body;

    const constraint = await Constraint.findByIdAndUpdate(
      req.params.id,
      { academicYear, semester, avoidDays, avoidSlots, avoidPeriods, maxHours },
      { new: true, runValidators: true }
    ).populate('staffId', 'name email department');

    if (!constraint) {
      return res.status(404).json({ message: 'Constraint not found' });
    }

    res.json({ message: 'Constraint updated successfully', constraint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a constraint
 * @route   DELETE /api/constraints/:id
 * @access  Admin
 */
export const deleteConstraint = async (req, res, next) => {
  try {
    const constraint = await Constraint.findByIdAndDelete(req.params.id);
    if (!constraint) {
      return res.status(404).json({ message: 'Constraint not found' });
    }
    res.json({ message: 'Constraint deleted successfully' });
  } catch (error) {
    next(error);
  }
};
