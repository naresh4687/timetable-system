import SubjectExpectation from '../models/SubjectExpectation.js';
import User from '../models/User.js';
import Curriculum from '../models/Curriculum.js';

/**
 * @desc    Submit or update subject expectation (staff only)
 * @route   POST /api/expectations
 * @access  Staff
 */
export const submitExpectation = async (req, res, next) => {
  try {
    const { preferredTheorySubjects, preferredLabSubjects, additionalNotes, academicYear, semesterType, semester } = req.body;

    if ((!preferredTheorySubjects || preferredTheorySubjects.length === 0) && (!preferredLabSubjects || preferredLabSubjects.length === 0)) {
      return res.status(400).json({ message: 'Please select subjects to submit.' });
    }

    // 1. Group by Semester + Section for Validation
    const sectionGroups = {};
    const addSubjectToGroup = (sub, type) => {
      const key = `${sub.semester}-${sub.section}`;
      if (!sectionGroups[key]) sectionGroups[key] = { theory: 0, lab: 0, sem: sub.semester, sec: sub.section };
      sectionGroups[key][type]++;
    };

    (preferredTheorySubjects || []).forEach(s => addSubjectToGroup(s, 'theory'));
    (preferredLabSubjects || []).forEach(s => addSubjectToGroup(s, 'lab'));

    // 2. Validate Every Section Group
    for (const key in sectionGroups) {
      const g = sectionGroups[key];
      
      // MIN constraints
      if (g.theory < 1) {
        return res.status(400).json({ message: `Semester ${g.sem} Section ${g.sec}: At least 1 Theory subject required.` });
      }
      if (g.lab < 1) {
        return res.status(400).json({ message: `Semester ${g.sem} Section ${g.sec}: At least 1 Lab subject required.` });
      }

      // MAX constraints
      if (g.theory > 3) {
        return res.status(400).json({ message: `Semester ${g.sem} Section ${g.sec}: Maximum 3 Theory subjects allowed.` });
      }
      if (g.lab > 2) {
        return res.status(400).json({ message: `Semester ${g.sem} Section ${g.sec}: Maximum 2 Lab subjects allowed.` });
      }
    }

    // 3. Exclusivity Check
    if (preferredTheorySubjects && preferredTheorySubjects.length > 0) {
      const otherStaffExpectations = await SubjectExpectation.find({
        academicYear,
        staffId: { $ne: req.user._id }
      });

      for (const pref of preferredTheorySubjects) {
        for (const otherExp of otherStaffExpectations) {
          const isTaken = (otherExp.preferredTheorySubjects || []).some(
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
      preferredLabSubjects: preferredLabSubjects || [],
      additionalNotes,
      academicYear,
      semesterType: semesterType || null,
      semester: semester || null,
    };

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
 * @desc    Get system deficiency/efficiency report (Admin only)
 * @route   GET /api/expectations/efficiency
 * @access  Admin
 */
export const getEfficiency = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    if (!academicYear) return res.status(400).json({ message: 'Academic year is required.' });

    // 1. Get all curriculum requirements
    const curricula = await Curriculum.find({ academicYear });
    const allExpectations = await SubjectExpectation.find({ academicYear });
    const allStaff = await User.find({ role: 'staff', isActive: true });

    const requirements = [];
    curricula.forEach(cur => {
      cur.subjects.forEach(sub => {
        for (let i = 0; i < cur.sections; i++) {
          const section = String.fromCharCode(65 + i);
          requirements.push({
            subject: sub.name,
            semester: cur.semester,
            section,
            type: sub.type,
            id: `${sub.name}-${cur.semester}-${section}`
          });
        }
      });
    });

    // 2. Identify filled vs deficient
    const deficient = [];
    requirements.forEach(reqObj => {
      const isFilled = allExpectations.some(exp => {
        if (reqObj.type === 'theory') {
          return (exp.preferredTheorySubjects || []).some(
            p => p.subject === reqObj.subject && p.semester === reqObj.semester && p.section === reqObj.section
          );
        } else {
          return (exp.preferredLabSubjects || []).some(
            p => p.subject === reqObj.subject && p.semester === reqObj.semester && p.section === reqObj.section
          );
        }
      });

      if (!isFilled) {
        // Find suggested staff (those who know this subject)
        const suggestions = allStaff.filter(s => 
          s.subjects.some(sub => 
            typeof sub === 'string' 
              ? sub.toLowerCase().includes(reqObj.subject.toLowerCase())
              : sub.subjectId?.toLowerCase().includes(reqObj.subject.toLowerCase())
          )
        ).map(s => ({ _id: s._id, name: s.name }));

        deficient.push({ ...reqObj, suggestions });
      }
    });

    res.json({ deficient });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auto-assign staff to deficient subjects (Admin only)
 * @route   POST /api/expectations/auto-assign
 * @access  Admin
 */
export const autoAssign = async (req, res, next) => {
  try {
    const { assignments, academicYear } = req.body;
    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ message: 'Assignments list is required.' });
    }

    const results = [];

    for (const task of assignments) {
      const { staffId, subject, semester, section, type } = task;
      
      const staff = await User.findById(staffId);
      if (!staff) continue;

      let expectation = await SubjectExpectation.findOne({ staffId, academicYear });
      
      if (!expectation) {
        expectation = new SubjectExpectation({
          staffId,
          staffName: staff.name,
          department: staff.department,
          academicYear,
          preferredTheorySubjects: [],
          preferredLabSubjects: []
        });
      }

      // Check current counts
      if (type === 'theory') {
        if (expectation.preferredTheorySubjects.length < 3) {
          // Exclusivity check
          const taken = await SubjectExpectation.findOne({
            academicYear,
            staffId: { $ne: staffId },
            'preferredTheorySubjects': { $elemMatch: { subject, semester, section } }
          });

          if (!taken) {
            expectation.preferredTheorySubjects.push({ subject, semester, section });
            await expectation.save();
            results.push({ subject, section, staff: staff.name, status: 'assigned' });

            // SECTION CONSISTENCY RULE: check other sections of same subject/semester
            const cur = await Curriculum.findOne({ semester, academicYear });
            if (cur && cur.sections > 1) {
              for (let i = 0; i < cur.sections; i++) {
                const otherSec = String.fromCharCode(65 + i);
                if (otherSec === section) continue;
                
                // If this other section is also vacant, assign it too (if staff capacity allows)
                if (expectation.preferredTheorySubjects.length < 3) {
                  const otherTaken = await SubjectExpectation.findOne({
                    academicYear,
                    'preferredTheorySubjects': { $elemMatch: { subject, semester, section: otherSec } }
                  });
                  if (!otherTaken) {
                    expectation.preferredTheorySubjects.push({ subject, semester, section: otherSec });
                    await expectation.save();
                    results.push({ subject, section: otherSec, staff: staff.name, status: 'assigned (consistency)' });
                  }
                }
              }
            }
          }
        }
      } else {
        // Lab check: only add if this specific section isn't already there
        const alreadyHasLab = (expectation.preferredLabSubjects || []).some(
          l => l.subject === subject && l.semester === semester && l.section === section
        );
        if (!alreadyHasLab) {
          expectation.preferredLabSubjects.push({ subject, semester, section });
          await expectation.save();
          results.push({ subject, section, staff: staff.name, status: 'assigned' });
        }
      }
    }

    res.json({ message: 'Auto-assignment complete.', results });
  } catch (error) {
    next(error);
  }
};
