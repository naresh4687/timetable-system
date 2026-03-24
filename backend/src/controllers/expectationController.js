import SubjectExpectation from '../models/SubjectExpectation.js';
import User from '../models/User.js';

/**
 * @desc    Submit or update subject expectation (staff only)
 * @route   POST /api/expectations
 * @access  Staff
 */
export const submitExpectation = async (req, res, next) => {
  try {
    const { preferredTheorySubjects, preferredLabSubject, additionalNotes, academicYear, semesterType, semester } = req.body;

    // Validate max 3 theory subjects
    if (preferredTheorySubjects && preferredTheorySubjects.length > 3) {
      return res.status(400).json({ message: 'Maximum 3 theory subjects allowed.' });
    }

    // Check for exclusivity (same subject, semester, section already taken by another staff)
    if (preferredTheorySubjects && preferredTheorySubjects.length > 0) {
      const otherStaffExpectations = await SubjectExpectation.find({
        academicYear,
        staffId: { $ne: req.user._id }
      });

      for (const pref of preferredTheorySubjects) {
        for (const otherExp of otherStaffExpectations) {
          const isTaken = otherExp.preferredTheorySubjects.some(
            taken => taken.subject === pref.subject && 
                     taken.semester === pref.semester && 
                     taken.section === pref.section
          );
          if (isTaken) {
            return res.status(400).json({ 
              message: `Subject ${pref.subject} for Semester ${pref.semester} Section ${pref.section} has already been selected by another staff member.` 
            });
          }
        }
      }
    }

    const data = {
      staffId: req.user._id,
      staffName: req.user.name,
      department: req.user.department,
      preferredTheorySubjects: preferredTheorySubjects || [],
      preferredLabSubject: preferredLabSubject || null,
      additionalNotes,
      academicYear,
      semesterType: semesterType || null,
      semester: semester || null,
    };

    // Upsert - update if exists, create if not
    const expectation = await SubjectExpectation.findOneAndUpdate(
      { staffId: req.user._id },
      data,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: 'Subject expectation saved successfully.', expectation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get own expectation (staff)
 * @route   GET /api/expectations/me
 * @access  Staff
 */
export const getMyExpectation = async (req, res, next) => {
  try {
    const expectation = await SubjectExpectation.findOne({ staffId: req.user._id });
    res.json({ expectation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all expectations (admin only)
 * @route   GET /api/expectations
 * @access  Admin
 */
export const getAllExpectations = async (req, res, next) => {
  try {
    const expectations = await SubjectExpectation.find()
      .populate('staffId', 'name email department')
      .sort({ updatedAt: -1 });

    res.json({ expectations });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete expectation
 * @route   DELETE /api/expectations/:id
 * @access  Admin
 */
export const deleteExpectation = async (req, res, next) => {
  try {
    const expectation = await SubjectExpectation.findByIdAndDelete(req.params.id);
    if (!expectation) return res.status(404).json({ message: 'Expectation not found.' });
    res.json({ message: 'Expectation deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get taken expectations by other staff members
 * @route   GET /api/expectations/taken?:academicYear
 * @access  Staff
 */
export const getTakenExpectations = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    if (!academicYear) {
      return res.status(400).json({ message: 'Academic year is required.' });
    }

    const otherExpectations = await SubjectExpectation.find({
      academicYear,
      staffId: { $ne: req.user._id }
    });

    const taken = [];
    otherExpectations.forEach(exp => {
      if (exp.preferredTheorySubjects) {
        exp.preferredTheorySubjects.forEach(pref => {
          taken.push({
            subject: pref.subject,
            semester: pref.semester,
            section: pref.section,
            staffName: exp.staffName
          });
        });
      }
    });

    res.json({ taken });
  } catch (error) {
    next(error);
  }
};
