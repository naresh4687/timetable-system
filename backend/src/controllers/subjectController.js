import Curriculum from '../models/Curriculum.js';
import MasterSubject from '../models/MasterSubject.js';

export const getMasterSubjects = async (req, res, next) => {
  try {
    const subjects = await MasterSubject.find().sort({ code: 1 });
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
};

export const createMasterSubject = async (req, res, next) => {
  try {
    const { name, code, type, credits, hoursPerWeek } = req.body;
    const existing = await MasterSubject.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }
    const subject = await MasterSubject.create({ name, code, type, credits, hoursPerWeek });
    res.status(201).json({ subject });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Get distinct academic years stored in Curriculum collection
 * @route GET /api/subjects/academic-years
 * @access Staff (authenticated)
 */
export const getAcademicYears = async (req, res, next) => {
  try {
    const result = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
    res.json({ academicYears: result });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Get semester list based on semesterType
 * @route GET /api/subjects/semesters?semesterType=odd|even
 * @access Staff (authenticated)
 */
export const getSemesters = (req, res) => {
  const { year, type } = req.query;

  const mapping = {
    '2023-2024': { odd: [1], even: [2] },
    '2024-2025': { odd: [3], even: [4] },
    '2025-2026': { odd: [5], even: [6] },
    '2026-2027': { odd: [7], even: [8] },
  };

  const semesters = mapping[year]?.[type] || [];
  res.json({ semesters });
};

/**
 * @desc  Get subjects filtered by year, semesterType, semester
 * @route GET /api/subjects?year=&semesterType=&semester=
 * @access Staff (authenticated)
 *
 * Returns: { theorySubjects: [...], labSubjects: [...] }
 */
export const getSubjectsByFilter = async (req, res, next) => {
  try {
    const { year: academicYear, type, semester } = req.query;

    if (!semester) {
      return res.status(400).json({ message: 'semester query param is required' });
    }
    if (!academicYear) {
      return res.status(400).json({ message: 'year query param is required' });
    }

    // Strip all whitespaces and normalize dashes
    const year = academicYear.replace(/\s+/g, '').replace(/–/g, '-');
    const selectedSemester = Number(semester);

    console.log("Incoming academicYear:", academicYear);
    console.log("Normalized academicYear:", year);
    console.log("Semester:", selectedSemester);

    // Validate mapping logic
    const mapping = {
      '2023-2024': [1, 2],
      '2024-2025': [3, 4],
      '2025-2026': [5, 6],
      '2026-2027': [7, 8],
    };

    if (mapping[year]) {
        if (!mapping[year].includes(selectedSemester)) {
            return res.status(400).json({ message: `Semester ${selectedSemester} is not allowed for academic year ${year}` });
        }
    } else {
        return res.status(400).json({ message: `Invalid academic year: ${year}` });
    }

    // Strictly match both academicYear and semester
    const query = { 
        academicYear: year,
        semester: selectedSemester 
    };

    const curriculum = await Curriculum.findOne(query);

    if (!curriculum) {
      return res.json({ theorySubjects: [], labSubjects: [] });
    }

    const theorySubjects = [];
    curriculum.subjects
      .filter((s) => s.type === 'theory')
      .forEach((s) => {
        for (let i = 0; i < curriculum.sections; i++) {
          theorySubjects.push({
            _id: `${s._id}_${i}`,
            name: s.name,
            code: s.code,
            credits: s.credits,
            hoursPerWeek: s.hoursPerWeek,
            semester: curriculum.semester,
            academicYear: curriculum.academicYear,
            semesterType: type || (curriculum.semester % 2 !== 0 ? 'odd' : 'even'),
            type: 'theory',
            section: String.fromCharCode(65 + i), // A, B, C...
          });
        }
      });

    const labSubjects = curriculum.subjects
      .filter((s) => s.type === 'lab')
      .map((s) => ({
        _id: s._id,
        name: s.name,
        code: s.code,
        credits: s.credits,
        hoursPerWeek: s.hoursPerWeek,
        semester: curriculum.semester,
        academicYear: curriculum.academicYear,
        semesterType: type || (curriculum.semester % 2 !== 0 ? 'odd' : 'even'),
        type: 'lab',
      }));

    res.json({ theorySubjects, labSubjects });
  } catch (err) {
    next(err);
  }
};
