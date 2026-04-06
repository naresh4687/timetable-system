import Curriculum from '../models/Curriculum.js';
import TimeTable from '../models/TimeTable.js';
import User from '../models/User.js';
import * as pdfParse from 'pdf-parse';
import * as docx from 'docx';
import { parseCurriculumText } from '../utils/fileParser.js';
import Constraint from '../models/Constraint.js';
import { checkConstraints } from '../utils/constraintUtils.js';

// ─── Period configuration ────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
    { period: 1, startTime: '09:15', endTime: '10:05' },
    { period: 2, startTime: '10:05', endTime: '10:55' },
    // Break 10:55 - 11:10
    { period: 3, startTime: '11:10', endTime: '12:00' },
    { period: 4, startTime: '12:00', endTime: '12:50' },
    // Lunch 12:50 - 1:45
    { period: 5, startTime: '13:45', endTime: '14:35' },
    { period: 6, startTime: '14:35', endTime: '15:25' },
    // Break 3:25 - 3:40
    { period: 7, startTime: '15:40', endTime: '16:30' },
];
const LAB_BLOCK = 4; // Labs = 4 consecutive periods

/**
 * @desc    Create or update curriculum for a semester
 * @route   POST /api/curriculum
 * @access  Manager
 */
export const saveCurriculum = async (req, res, next) => {
    try {
        const { semester, academicYear, subjects, sections } = req.body;

        if (!semester || !academicYear || !subjects || subjects.length === 0) {
            return res.status(400).json({ message: 'Semester, academic year, and at least one subject are required.' });
        }

        const curriculum = await Curriculum.findOneAndUpdate(
            { semester },
            { semester, academicYear, subjects, sections: sections || 1, createdBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ message: 'Curriculum saved successfully.', curriculum });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Parse uploaded curriculum file (PDF/DOCX)
 * @route   POST /api/curriculum/parse
 * @access  Manager
 */
export const parseUploadedCurriculum = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const originalname = req.file.originalname.toLowerCase();
        let rawText = '';

        if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
            const pdfData = await pdfParse.default(buffer);
            rawText = pdfData.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            originalname.endsWith('.docx')
        ) {
            // Unpack DOCX and extract text (using mammoth or simply reading raw buffer text heuristically)
            // For a robust implementation, docx extraction usually requires the 'mammoth' package.
            // Since we installed 'docx' which is mostly for *generating* docs, we'll try a basic string extraction 
            // from the raw buffer if mammoth is not available, or attempt to parse the XML.
            // A more straightforward way without external extractors is doing a fast regex over the buffer string:
            const rawStr = buffer.toString('utf8');
            // Very naive extraction: remove XML tags.
            rawText = rawStr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        } else {
             return res.status(400).json({ message: 'Unsupported file type. Please upload a PDF or DOCX file.' });
        }

        const parsedSubjects = parseCurriculumText(rawText);

        res.json({
            message: 'File parsed successfully.',
            subjects: parsedSubjects,
            rawTextPreview: rawText.substring(0, 500) // helpful for debugging
        });
    } catch (error) {
        console.error('File parsing error:', error);
        res.status(500).json({ message: 'Error parsing the document.' });
    }
};

/**
 * @desc    Get all curricula
 * @route   GET /api/curriculum
 * @access  Manager
 */
export const getAllCurricula = async (req, res, next) => {
    try {
        const curricula = await Curriculum.find()
            .populate('createdBy', 'name')
            .sort({ semester: 1 });
        res.json({ curricula });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get curriculum for a specific semester
 * @route   GET /api/curriculum/:semester
 * @access  Manager
 */
export const getCurriculumBySemester = async (req, res, next) => {
    try {
        const curriculum = await Curriculum.findOne({ semester: Number(req.params.semester) })
            .populate('createdBy', 'name');
        if (!curriculum) return res.status(404).json({ message: 'Curriculum not found for this semester.' });
        res.json({ curriculum });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete curriculum for a semester
 * @route   DELETE /api/curriculum/:semester
 * @access  Manager
 */
export const deleteCurriculum = async (req, res, next) => {
    try {
        const curriculum = await Curriculum.findOneAndDelete({ semester: Number(req.params.semester) });
        if (!curriculum) return res.status(404).json({ message: 'Curriculum not found.' });
        res.json({ message: 'Curriculum deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// ─── Utility: shuffle array (Fisher-Yates) ───────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Find staff for a subject ────────────────────────────────────────────────
function findStaffForSubject(subjectName, allStaff) {
    const matches = allStaff.filter((s) =>
        s.subjects.some((sub) =>
            sub.toLowerCase().includes(subjectName.toLowerCase()) ||
            subjectName.toLowerCase().includes(sub.toLowerCase())
        )
    );
    return matches;
}

// ─── Check if staff is available at a given day+period across all schedules ──
function isStaffAvailable(staffId, dayName, periodIdx, allSchedules) {
    if (!staffId) return true;
    const key = `${staffId}-${dayName}-${periodIdx}`;
    return !allSchedules.has(key);
}

// ─── Mark staff as booked ────────────────────────────────────────────────────
function bookStaff(staffId, dayName, periodIdx, allSchedules) {
    if (!staffId) return;
    const key = `${staffId}-${dayName}-${periodIdx}`;
    allSchedules.add(key);
}

/**
 * Generate a weekly schedule from curriculum subjects with:
 *   - Labs: 4 consecutive periods
 *   - Randomized placement
 *   - Auto staff assignment with conflict checking
 *   - Max 2 slots of the same theory subject per day
 *   - No forced break — all 7 periods are teaching periods
 */
function generateSchedule(subjects, allStaff, globalStaffBookings, globalStaffHours, allConstraints, semester, academicYear) {
    // Build pools of required slots
    const theoryPool = [];
    const labPool = [];

    for (const sub of subjects) {
        const candidates = findStaffForSubject(sub.name, allStaff);
        if (sub.type === 'lab') {
            // Each lab session = 4 consecutive periods
            const blocks = Math.max(1, Math.floor(sub.hoursPerWeek / LAB_BLOCK));
            labPool.push({
                name: sub.name,
                code: sub.code,
                remainingBlocks: blocks,
                staffCandidates: candidates,
            });
        } else {
            theoryPool.push({
                name: sub.name,
                code: sub.code,
                remaining: sub.hoursPerWeek,
                staffCandidates: candidates,
            });
        }
    }

    const schedule = [];
    const shuffledDays = shuffle(DAYS);

    for (const dayName of shuffledDays) {
        const slots = PERIODS.map((p) => ({
            ...p,
            subject: '',
            staffId: undefined,
            staffName: '',
            classroom: '',
            type: 'free',
        }));

        const usedPeriods = new Set();
        const dailySubjectCount = {};

        // ── Step 1: Place lab blocks (4 consecutive periods) ──
        // Possible starting indices for a 4-period block: 0, 1, 2, 3
        // (0→[0,1,2,3], 1→[1,2,3,4], 2→[2,3,4,5], 3→[3,4,5,6])
        const possibleLabStarts = shuffle([0, 1, 2, 3]);

        for (const startIdx of possibleLabStarts) {
            // Find a lab that needs hours
            const lab = shuffle(labPool).find((l) => l.remainingBlocks > 0);
            if (!lab) break;

            // Build the 4-period block indices
            const blockIndices = Array.from({ length: LAB_BLOCK }, (_, i) => startIdx + i);

            // Check all 4 slots are free
            if (blockIndices.some((idx) => usedPeriods.has(idx))) continue;

            // Find available staff for all 4 periods
            const shuffledCandidates = shuffle(lab.staffCandidates);
            let assignedStaff = null;
            for (const staff of shuffledCandidates) {
                const staffIdStr = staff._id.toString();
                // Find constraint doc
                const staffConstraint = allConstraints.find(c => 
                    c.staffId.toString() === staffIdStr && 
                    c.semester === semester && 
                    c.academicYear === academicYear
                );
                
                const pseudoStaff = { hours: globalStaffHours[staffIdStr] };
                
                let allAvail = true;
                for (const idx of blockIndices) {
                    if (!isStaffAvailable(staffIdStr, dayName, idx, globalStaffBookings)) {
                        allAvail = false;
                        break;
                    }
                    if (!checkConstraints(pseudoStaff, dayName, PERIODS[idx].period, staffConstraint)) {
                        allAvail = false;
                        break;
                    }
                }
                
                if (allAvail) {
                    assignedStaff = staff;
                    break;
                }
            }

            // Place the lab block
            for (const idx of blockIndices) {
                slots[idx].subject = lab.name;
                slots[idx].type = 'lab';
                if (assignedStaff) {
                    slots[idx].staffId = assignedStaff._id;
                    slots[idx].staffName = assignedStaff.name;
                }
                usedPeriods.add(idx);
            }

            // Book the staff
            if (assignedStaff) {
                const sIdStr = assignedStaff._id.toString();
                globalStaffHours[sIdStr] += blockIndices.length;
                for (const idx of blockIndices) {
                    bookStaff(sIdStr, dayName, idx, globalStaffBookings);
                }
            }

            lab.remainingBlocks--;
        }

        // ── Step 2: Fill remaining with theory (randomized order) ──
        const freePeriods = [];
        for (let i = 0; i < slots.length; i++) {
            if (!usedPeriods.has(i)) freePeriods.push(i);
        }
        const shuffledFree = shuffle(freePeriods);

        for (const idx of shuffledFree) {
            const shuffledTheory = shuffle(theoryPool);
            const theory = shuffledTheory.find((t) => {
                if (t.remaining <= 0) return false;
                const todayCount = dailySubjectCount[t.name] || 0;
                return todayCount < 2;
            });

            if (!theory) continue;

            // Find available staff
            const shuffledCandidates = shuffle(theory.staffCandidates);
            let assignedStaff = null;
            for (const staff of shuffledCandidates) {
                const staffIdStr = staff._id.toString();
                const staffConstraint = allConstraints.find(c => 
                    c.staffId.toString() === staffIdStr && 
                    c.semester === semester && 
                    c.academicYear === academicYear
                );
                const pseudoStaff = { hours: globalStaffHours[staffIdStr] };

                if (isStaffAvailable(staffIdStr, dayName, idx, globalStaffBookings)) {
                    if (checkConstraints(pseudoStaff, dayName, PERIODS[idx].period, staffConstraint)) {
                        assignedStaff = staff;
                        break;
                    }
                }
            }

            slots[idx].subject = theory.name;
            slots[idx].type = 'theory';
            if (assignedStaff) {
                const sIdStr = assignedStaff._id.toString();
                slots[idx].staffId = assignedStaff._id;
                slots[idx].staffName = assignedStaff.name;
                globalStaffHours[sIdStr] += 1;
                bookStaff(sIdStr, dayName, idx, globalStaffBookings);
            }

            theory.remaining--;
            dailySubjectCount[theory.name] = (dailySubjectCount[theory.name] || 0) + 1;
        }

        schedule.push({ day: dayName, slots });
    }

    // Sort schedule back to Mon-Fri order
    const dayOrder = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };
    schedule.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);

    return schedule;
}

/**
 * @desc    Bulk generate timetables for even or odd semesters
 * @route   POST /api/curriculum/generate
 * @access  Manager
 * @body    { title: String, type: 'even' | 'odd', department: String }
 */
export const generateBulkTimetables = async (req, res, next) => {
    try {
        const { title, type, department } = req.body;

        if (!type || !['even', 'odd'].includes(type)) {
            return res.status(400).json({ message: 'Type must be "even" or "odd".' });
        }
        if (!title || !department) {
            return res.status(400).json({ message: 'Title and department are required.' });
        }

        const semesters = type === 'even' ? [2, 4, 6, 8] : [1, 3, 5, 7];

        // Fetch curricula
        const curricula = await Curriculum.find({ semester: { $in: semesters } });

        if (curricula.length === 0) {
            return res.status(400).json({
                message: `No curricula defined for ${type} semesters. Please add curricula first.`,
            });
        }

        // Fetch all staff
        const allStaff = await User.find({
            role: 'staff',
            isActive: true,
        }).select('_id name subjects department');

        // Fetch constraints
        const allConstraints = await Constraint.find({});

        // Global staff bookings to prevent double-booking across ALL sections
        const globalStaffBookings = new Set();
        const globalStaffHours = {};
        allStaff.forEach(s => globalStaffHours[s._id.toString()] = 0);

        const created = [];
        const errors = [];

        for (const curriculum of curricula) {
            const sectionLabels = Array.from({ length: curriculum.sections }, (_, i) =>
                String.fromCharCode(65 + i)
            );

            for (const section of sectionLabels) {
                try {
                    const schedule = generateSchedule(
                        curriculum.subjects,
                        allStaff,
                        globalStaffBookings,
                        globalStaffHours,
                        allConstraints,
                        curriculum.semester,
                        curriculum.academicYear
                    );

                    const year = Math.ceil(curriculum.semester / 2);
                    const ttTitle = `${title} - Year ${year} - Sem ${curriculum.semester} - Section ${section}`;

                    const existing = await TimeTable.findOne({
                        department,
                        semester: curriculum.semester,
                        section,
                        academicYear: curriculum.academicYear,
                    });

                    if (existing) {
                        existing.title = ttTitle;
                        existing.schedule = schedule;
                        await existing.save();
                        created.push({ id: existing._id, title: ttTitle, action: 'updated' });
                    } else {
                        const timetable = await TimeTable.create({
                            title: ttTitle,
                            department,
                            semester: curriculum.semester,
                            section,
                            academicYear: curriculum.academicYear,
                            schedule,
                            createdBy: req.user._id,
                        });
                        created.push({ id: timetable._id, title: ttTitle, action: 'created' });
                    }
                } catch (err) {
                    errors.push({ semester: curriculum.semester, section, error: err.message });
                }
            }
        }

        const missing = semesters.filter((s) => !curricula.find((c) => c.semester === s));

        res.json({
            message: `Bulk generation complete for ${type} semesters.`,
            created,
            errors,
            missingSemesters: missing,
        });
    } catch (error) {
        next(error);
    }
};
