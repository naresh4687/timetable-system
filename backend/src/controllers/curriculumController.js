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

// ─── Room Configuration ──────────────────────────────────────────────────────
const ROOM_POOL = {
    theory: [
        'CR-101', 'CR-102', 'CR-103', 'CR-104', 'CR-105', 
        'CR-106', 'CR-107', 'CR-108', 'CR-109', 'CR-110'
    ],
    lab: [
        'LAB-DS-01', 'LAB-DS-02', 'LAB-DS-03', 'LAB-AI-01', 'LAB-AI-02'
    ]
};

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

// ─── Utility: group candidates by category, shuffle within each tier ──────────
// Ensures Class A staff tried before Class B,
// but within the same category order is random (fair distribution)
function groupAndShuffleByCategory(candidates) {
    const tiers = { 'A': [], 'B': [] };
    for (const c of candidates) {
        const cat = c.category || 'B';
        if (tiers[cat]) tiers[cat].push(c);
        else tiers['B'].push(c);
    }
    return [...shuffle(tiers['A']), ...shuffle(tiers['B'])];
}

// ─── Utility: group candidates by preference level, shuffle within each tier ──
// Ensures High (1) -> Medium (2) -> Low (3) priority,
// but within the same level order is random (fair distribution)
function groupAndShuffleByPreference(candidates) {
    const levels = { 1: [], 2: [], 3: [] };
    for (const c of candidates) {
        const p = c.preference || 3;
        if (levels[p]) levels[p].push(c);
        else levels[3].push(c);
    }
    return [...shuffle(levels[1]), ...shuffle(levels[2]), ...shuffle(levels[3])];
}

// ─── Find staff for a subject (category & preference aware) ──────────────────
// Returns array of { staff, category, preference }
function findStaffForSubject(subject, allStaff) {
    const { name: subjectName, code: subjectCode } = subject;
    const matches = [];
    for (const s of allStaff) {
        for (const sub of s.subjects) {
            const subNameOrCode = typeof sub === 'string' ? sub : sub.subjectId;
            if (!subNameOrCode) continue;

            const normalizedStored = subNameOrCode.toLowerCase();
            const normalizedName = subjectName.toLowerCase();
            const normalizedCode = subjectCode ? subjectCode.toLowerCase() : '';

            const isNameMatch = normalizedStored.includes(normalizedName) || normalizedName.includes(normalizedStored);
            const isCodeMatch = normalizedCode && (normalizedStored === normalizedCode);

            if (isNameMatch || isCodeMatch) {
                matches.push({ 
                    staff: s, 
                    category: s.category || 'B',
                    preference: sub.preference || 3 
                });
                break; // one entry per staff member
            }
        }
    }
    // Initial sort: Class A first (institutional rule), then Class B
    matches.sort((a, b) => {
        if (a.category === 'A' && b.category === 'B') return -1;
        if (a.category === 'B' && b.category === 'A') return 1;
        return 0;
    });
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

// ─── Unmark staff booking (essential for CSP backtracking UNDO) ───────────────
// ⚠ CRITICAL FIX: This function was previously missing, causing every backtrack
//   call to throw ReferenceError and making the CSP engine non-functional.
function unBookStaff(staffId, dayName, periodIdx, allSchedules) {
    if (!staffId) return;
    const key = `${staffId}-${dayName}-${periodIdx}`;
    allSchedules.delete(key);
}

// ─── Check if room is available ──────────────────────────────────────────────
function isRoomAvailable(room, dayName, periodIdx, roomBookings) {
    if (!room) return true;
    const key = `${room}-${dayName}-${periodIdx}`;
    return !roomBookings.has(key);
}

// ─── Mark room as booked ─────────────────────────────────────────────────────
function bookRoom(room, dayName, periodIdx, roomBookings) {
    if (!room) return;
    const key = `${room}-${dayName}-${periodIdx}`;
    roomBookings.add(key);
}

// ─── Unmark room booking (for backtracking) ──────────────────────────────────
function unBookRoom(room, dayName, periodIdx, roomBookings) {
    if (!room) return;
    const key = `${room}-${dayName}-${periodIdx}`;
    roomBookings.delete(key);
}

/**
 * @desc    Load all existing active bookings from DB for the current cycle
 */
async function loadExistingBookings(academicYear, staffBookings, roomBookings, staffHours) {
    const existingTimetables = await TimeTable.find({ academicYear, isActive: true });
    
    for (const tt of existingTimetables) {
        for (const daySchedule of tt.schedule) {
            const dayName = daySchedule.day;
            for (let i = 0; i < daySchedule.slots.length; i++) {
                const slot = daySchedule.slots[i];
                if (slot.type === 'free' || slot.type === 'break') continue;

                // Book staff 1
                if (slot.staffId) {
                    const sId = slot.staffId.toString();
                    const key = `${sId}-${dayName}-${i}`;
                    staffBookings.add(key);
                    staffHours[sId] = (staffHours[sId] || 0) + 1; 
                    // Lab hours are usually handled as blocks, but for tracking total hours...
                    // Wait, the logic for total hours in generator is a bit different.
                    // Let's keep it simple: if it's in the DB, it counts towards maxHours.
                }
                // Book staff 2 (labs)
                if (slot.staff2Id) {
                    const sId2 = slot.staff2Id.toString();
                    staffBookings.add(`${sId2}-${dayName}-${i}`);
                }
                // Book room
                if (slot.classroom) {
                    roomBookings.add(`${slot.classroom}-${dayName}-${i}`);
                }
            }
        }
    }
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * CSP BACKTRACKING ENGINE FOR THEORY ALLOCATION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Problem Type : Constraint Satisfaction Problem (CSP)
 * Variables    : subject-hour units  e.g. AI×4hrs → AI_1, AI_2, AI_3, AI_4
 * Domain       : (dayName × slotIdx × staffMember) combinations
 * Constraints  : no clash | avoidDays | avoidPeriods | avoidSlots | maxHours
 *                max 2 same-subject periods per day
 *
 * Variable Ordering (MRV heuristic):
 *   1. Fewest eligible staff first (most constrained variable first)
 *   2. Most hours needed (widest search space = try early)
 *   3. Round-robin interleaving across subjects (spreads subjects across days)
 *
 * Algorithm:
 *   backtrack(index)
 *     base case : index === total units → return true  (✅ full solution)
 *     for each free slot (shuffled at start for timetable variety):
 *       for each staff (preference order 1→2→3):
 *         if ALL constraints pass:
 *           ── Forward-Check: ensure remaining units still solvable ──
 *           ASSIGN  (mutate grid + bookings + hours + dailyCount)
 *           if backtrack(index+1) returns true → return true
 *           UNDO    (full rollback of all mutations)  ← unBookStaff was MISSING
 *     if subject has NO staff → place slot with staffName:'TBD' (staff-free)
 *     return false  (triggers backtrack in caller)
 *
 * Fallback:
 *   If backtrack(0) cannot find a complete solution, a greedy pass fills any
 *   remaining units so the timetable is never left partially empty.
 */
function allocateTheoryCSP(
    theorySubjects,
    grid,
    globalStaffBookings,
    globalRoomBookings,
    globalStaffHours,
    allStaff,
    allConstraints,
    semester,
    academicYear
) {
    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Collect all free slots (post-lab) and shuffle for variety
    // ──────────────────────────────────────────────────────────────────────────────
    const freeSlots = [];
    for (const dayName of DAYS) {
        for (let slotIdx = 0; slotIdx < PERIODS.length; slotIdx++) {
            if (grid[dayName][slotIdx].type === 'free') {
                freeSlots.push({ dayName, slotIdx, period: PERIODS[slotIdx].period });
            }
        }
    }
    shuffle(freeSlots); // Shuffled once — fixed order used by all recursive calls

    if (freeSlots.length === 0 || theorySubjects.length === 0) return;

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Build eligible staff per subject (sorted: Class A first, shuffled within category)
    // ──────────────────────────────────────────────────────────────────────────────
    const subjectStaffMap = new Map(); // subjectName → [{ staff, category, preference }]
    for (const theory of theorySubjects) {
        const raw = findStaffForSubject(theory, allStaff);
        // Use preference-aware shuffling for theory subjects
        subjectStaffMap.set(theory.name, groupAndShuffleByPreference(raw));
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 3. Variable Ordering: MRV heuristic
    //    Sort subjects: fewest eligible staff first (most constrained),
    //    then most hours first (hardest to spread).
    //    Round-robin interleaving ensures every subject is spread across days.
    // ──────────────────────────────────────────────────────────────────────────────
    const sortedSubjects = [...theorySubjects].sort((a, b) => {
        const aStaff = subjectStaffMap.get(a.name)?.length ?? 0;
        const bStaff = subjectStaffMap.get(b.name)?.length ?? 0;
        if (aStaff !== bStaff) return aStaff - bStaff;   // fewer staff = more constrained = first
        return b.hoursNeeded - a.hoursNeeded;              // more hours = harder to fill = first
    });

    // Round-robin expansion: interleave one unit from each subject per round
    // [AI_1, DBMS_1, OS_1, AI_2, DBMS_2, OS_2, AI_3 ...]
    const subjectUnits = [];
    const maxRounds = Math.max(...sortedSubjects.map(s => s.hoursNeeded), 0);
    for (let round = 0; round < maxRounds; round++) {
        for (const sub of sortedSubjects) {
            if (round < sub.hoursNeeded) {
                subjectUnits.push({ subjectName: sub.name });
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 4. Mutable CSP state — all fields are reversed during backtracking
    // ──────────────────────────────────────────────────────────────────────────────
    const dailyCount = {}; // `${day}||${subject}` → count
    const incDaily = (d, s) => { const k = `${d}||${s}`; dailyCount[k] = (dailyCount[k] || 0) + 1; };
    const decDaily = (d, s) => { const k = `${d}||${s}`; dailyCount[k] = Math.max(0, (dailyCount[k] || 0) - 1); };
    const getDaily = (d, s) => dailyCount[`${d}||${s}`] || 0;

    // Constraint lookup (per staff × semester × year)
    const getConstraint = (sIdStr) =>
        allConstraints.find(
            c => c.staffId.toString() === sIdStr &&
                 c.semester === semester &&
                 c.academicYear === academicYear
        );

    // ──────────────────────────────────────────────────────────────────────────────
    // 5. FORWARD CHECK
    //    After tentatively placing unit at `index`, verify that every REMAINING
    //    unit (index+1 onward) still has at least one valid (slot, staff) pair.
    //    Returns false immediately if any future unit is a dead-end → prunes branch.
    //
    //    Accuracy priority: checks full constraint suite for each future unit.
    // ──────────────────────────────────────────────────────────────────────────────
    function forwardCheck(fromIndex) {
        for (let i = fromIndex; i < subjectUnits.length; i++) {
            const { subjectName } = subjectUnits[i];
            const staffList = subjectStaffMap.get(subjectName) || [];
            let canPlace = false;

            // Subject with no staff → only needs any free slot
            if (staffList.length === 0) {
                for (const { dayName, slotIdx } of freeSlots) {
                    if (grid[dayName][slotIdx].type === 'free' && getDaily(dayName, subjectName) < 2) {
                        canPlace = true;
                        break;
                    }
                }
            } else {
                outerLoop:
                for (const { dayName, slotIdx, period } of freeSlots) {
                    if (grid[dayName][slotIdx].type !== 'free') continue;
                    if (getDaily(dayName, subjectName) >= 2) continue;
                    for (const { staff } of staffList) {
                        const sId = staff._id.toString();
                        const constraint = getConstraint(sId);
                        const pseudoStaff = { hours: globalStaffHours[sId] || 0 };
                        if (!isStaffAvailable(sId, dayName, slotIdx, globalStaffBookings)) continue;
                        if (!checkConstraints(pseudoStaff, dayName, period, constraint)) continue;
                        canPlace = true;
                        break outerLoop;
                    }
                }
            }

            if (!canPlace) return false; // This future unit is a dead-end → prune
        }
        return true; // All future units have at least one valid placement
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 6. BACKTRACKING FUNCTION  (CSP Solver core)
    //
    //   backtrack(index)
    //     if index === subjectUnits.length → SUCCESS ✅
    //     for each free slot:
    //       [Case A] No staff mapped → place with staffName:'TBD'
    //       [Case B] Staff mapped → try each in preference order:
    //         ✔ Constraint checks (mandatory):
    //             isStaffAvailable (no clash)
    //             checkConstraints (avoidDays/Periods/Slots/maxHours)
    //         ✔ Forward check  (prunes dead branches)
    //         ASSIGN  (mutate grid + bookings + hours + dailyCount)
    //         if backtrack(index+1) → return true
    //         UNDO    (full rollback — the key correctness step)
    //     return false → triggers caller to backtrack
    // ──────────────────────────────────────────────────────────────────────────────
    function backtrack(index) {
        // ── BASE CASE ──────────────────────────────────────────────────────────────
        if (index === subjectUnits.length) return true; // ✅ All units placed

        const { subjectName } = subjectUnits[index];
        const staffList = subjectStaffMap.get(subjectName) || [];
        const noMappedStaff = staffList.length === 0;

        // ── DYNAMIC SLOT ORDERING ──
        // Sort free slots so we ALWAYS try days with the lowest total theory+lab count first.
        // This spreads subjects evenly across the week and prevents Mon-Wed clustering.
        const currentSlots = [...freeSlots].sort((a, b) => {
            const loadA = Object.values(grid[a.dayName]).filter(s => s.type !== 'free').length;
            const loadB = Object.values(grid[b.dayName]).filter(s => s.type !== 'free').length;
            if (loadA !== loadB) return loadA - loadB;
            return 0; // Keep relative shuffled order for same-load days
        });

        for (const { dayName, slotIdx, period } of currentSlots) {
            // ── Gate 1: Slot must be free ──────────────────────────────────────────
            if (grid[dayName][slotIdx].type !== 'free') continue;

            // ── Gate 2: Max 2 of same subject per day ─────────────────────────────
            if (getDaily(dayName, subjectName) >= 2) continue;

            // ══════════════════════════════════════════════════════════════════════
            // CASE A — No staff mapped for this subject
            //   → Place with staffName: 'TBD'  (timetable slot still filled)
            // ══════════════════════════════════════════════════════════════════════
            if (noMappedStaff) {
                // Find an available room
                const availableRoom = ROOM_POOL.theory.find(r => isRoomAvailable(r, dayName, slotIdx, globalRoomBookings));
                if (!availableRoom) continue; // No room available for this slot

                // ASSIGN
                grid[dayName][slotIdx] = {
                    ...PERIODS[slotIdx],
                    subject:   subjectName,
                    type:      'theory',
                    staffId:   null,
                    staffName: 'TBD',
                    classroom: availableRoom,
                };
                incDaily(dayName, subjectName);
                bookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);

                if (backtrack(index + 1)) return true; // ✅

                // UNDO
                grid[dayName][slotIdx] = {
                    ...PERIODS[slotIdx],
                    subject: '', staffId: undefined, staffName: '', classroom: '', type: 'free',
                };
                decDaily(dayName, subjectName);
                unBookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                continue; // Try next slot
            }

            // ══════════════════════════════════════════════════════════════════════
            // CASE B — Staff mapped → try each in preference order (1 → 2 → 3)
            // ══════════════════════════════════════════════════════════════════════
            for (const { staff } of staffList) {
                const sId = staff._id.toString();
                const constraint = getConstraint(sId);
                const pseudoStaff = { hours: globalStaffHours[sId] || 0 };

                // ── Constraint Check 1: No staff clash (global — across all sections) ──
                if (!isStaffAvailable(sId, dayName, slotIdx, globalStaffBookings)) continue;

                // ── Constraint Check 2: Preference is secondary — constraints win ──────
                //    avoidDays | avoidPeriods | avoidSlots | maxHours
                if (!checkConstraints(pseudoStaff, dayName, period, constraint)) continue;

                // ── Constraint Check 3: Room Availability ─────────────────────────────
                const availableRoom = ROOM_POOL.theory.find(r => isRoomAvailable(r, dayName, slotIdx, globalRoomBookings));
                if (!availableRoom) continue;

                // ── ASSIGN (tentative) ─────────────────────────────────────────────────
                grid[dayName][slotIdx] = {
                    ...PERIODS[slotIdx],
                    subject:      subjectName,
                    type:         'theory',
                    staffId:      staff._id,
                    staffName:    staff.name,
                    categoryUsed: staff.category || 'B',
                    classroom:    availableRoom,
                };
                bookStaff(sId, dayName, slotIdx, globalStaffBookings);
                bookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                globalStaffHours[sId] = (globalStaffHours[sId] || 0) + 1;
                incDaily(dayName, subjectName);

                // ── Forward Check — prune dead branches before recursing ────────────────
                //    Checks if every remaining unit (index+1 ...) still has ≥1 valid value.
                if (!forwardCheck(index + 1)) {
                    // UNDO tentative assignment and try next staff/slot
                    grid[dayName][slotIdx] = {
                        ...PERIODS[slotIdx],
                        subject: '', staffId: undefined, staffName: '', classroom: '', type: 'free',
                    };
                    unBookStaff(sId, dayName, slotIdx, globalStaffBookings); 
                    unBookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                    globalStaffHours[sId] = Math.max(0, (globalStaffHours[sId] || 0) - 1);
                    decDaily(dayName, subjectName);
                    continue; // Try next staff member
                }

                // ── RECURSE ─────────────────────────────────────────────────────────────
                if (backtrack(index + 1)) return true; // ✅ Propagate success upward

                // ── BACKTRACK: Full undo of this assignment ──────────────────────────────
                grid[dayName][slotIdx] = {
                    ...PERIODS[slotIdx],
                    subject: '', staffId: undefined, staffName: '', classroom: '', type: 'free',
                };
                unBookStaff(sId, dayName, slotIdx, globalStaffBookings); 
                unBookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                globalStaffHours[sId] = Math.max(0, (globalStaffHours[sId] || 0) - 1);
                decDaily(dayName, subjectName);
                // Continue to next staff member in the preference queue
            }
        }

        return false; // No (slot × staff) pair worked → signal failure up the call stack
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 7. GREEDY FALLBACK
    //    If CSP backtracking cannot produce a complete solution, this greedy pass
    //    fills any remaining unassigned units so the timetable is never left empty.
    //    Constraints are still respected; forward-checking is skipped for speed.
    // ──────────────────────────────────────────────────────────────────────────────
    function greedyFallback() {
        for (const { subjectName } of subjectUnits) {
            const staffList = subjectStaffMap.get(subjectName) || [];
            let placed = false;

            // Only fill units that haven't been placed by CSP
            const hoursPlaced = freeSlots.filter(
                ({ dayName, slotIdx }) =>
                    grid[dayName][slotIdx].type === 'theory' &&
                    grid[dayName][slotIdx].subject === subjectName
            ).length;
            const hoursNeeded = theorySubjects.find(s => s.name === subjectName)?.hoursNeeded || 0;
            if (hoursPlaced >= hoursNeeded) continue; // Already fully placed by CSP

            for (const { dayName, slotIdx, period } of freeSlots) {
                if (placed) break;
                if (grid[dayName][slotIdx].type !== 'free') continue;
                if (getDaily(dayName, subjectName) >= 2) continue;

                if (staffList.length === 0) {
                    const availableRoom = ROOM_POOL.theory.find(r => isRoomAvailable(r, dayName, slotIdx, globalRoomBookings));
                    if (!availableRoom) continue;

                    grid[dayName][slotIdx] = {
                        ...PERIODS[slotIdx],
                        subject: subjectName, type: 'theory',
                        staffId: null, staffName: 'TBD', classroom: availableRoom,
                    };
                    incDaily(dayName, subjectName);
                    bookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                    placed = true;
                    continue;
                }

                for (const { staff } of staffList) {
                    const sId = staff._id.toString();
                    const constraint = getConstraint(sId);
                    const pseudoStaff = { hours: globalStaffHours[sId] || 0 };
                    
                    if (!isStaffAvailable(sId, dayName, slotIdx, globalStaffBookings)) continue;
                    if (!checkConstraints(pseudoStaff, dayName, period, constraint)) continue;
                    
                    const availableRoom = ROOM_POOL.theory.find(r => isRoomAvailable(r, dayName, slotIdx, globalRoomBookings));
                    if (!availableRoom) continue;

                    grid[dayName][slotIdx] = {
                        ...PERIODS[slotIdx],
                        subject:      subjectName,
                        type:         'theory',
                        staffId:      staff._id,
                        staffName:    staff.name,
                        categoryUsed: staff.category || 'B',
                        classroom:    availableRoom,
                    };
                    bookStaff(sId, dayName, slotIdx, globalStaffBookings);
                    bookRoom(availableRoom, dayName, slotIdx, globalRoomBookings);
                    globalStaffHours[sId] = (globalStaffHours[sId] || 0) + 1;
                    incDaily(dayName, subjectName);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                console.warn(`[CSP Fallback] ⚠ Could not place "${subjectName}" — no valid (slot × staff) found.`);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 8. EXECUTE
    // ──────────────────────────────────────────────────────────────────────────────
    const totalUnits = subjectUnits.length;
    const totalSlots  = freeSlots.length;

    // Pre-check: warn if demand exceeds capacity
    if (totalSlots < totalUnits) {
        console.warn(
            `[CSP] ⚠ Capacity mismatch: ${totalUnits} theory units needed but only ${totalSlots} free slots available.`
        );
    }
    console.log(`[CSP] 🚀 Starting backtrack: ${totalUnits} units across ${totalSlots} free slots.`);

    const solved = backtrack(0);

    if (solved) {
        console.log('[CSP] ✅ Complete solution found via backtracking — zero constraint violations.');
    } else {
        console.warn('[CSP] ⚠ Backtracking could not find a full solution. Running greedy fallback...');
        greedyFallback();
        console.log('[CSP] 🔁 Greedy fallback complete. Timetable filled as best-effort.');
    }
}



// ════════════════════════════════════════════════════════════════════════════
// DUAL-STAFF VALIDATOR FOR LAB SESSIONS
// Both staff must: be distinct, have no booking clash, pass constraints.
// ════════════════════════════════════════════════════════════════════════════
function isValidForTwoStaff(
    s1Id, s2Id,
    s1Constraint, s2Constraint,
    s1Hours, s2Hours,
    dayName, blockIdx,
    globalStaffBookings,
    globalRoomBookings
) {
    if (!s1Id || !s2Id || s1Id === s2Id) return false;
    
    // Check room availability for the whole block
    const availableRoom = ROOM_POOL.lab.find(r => 
        blockIdx.every(idx => isRoomAvailable(r, dayName, idx, globalRoomBookings))
    );
    if (!availableRoom) return false;

    for (const idx of blockIdx) {
        const period = PERIODS[idx].period;
        if (!isStaffAvailable(s1Id, dayName, idx, globalStaffBookings)) return false;
        if (!checkConstraints({ hours: s1Hours }, dayName, period, s1Constraint)) return false;
        if (!isStaffAvailable(s2Id, dayName, idx, globalStaffBookings)) return false;
        if (!checkConstraints({ hours: s2Hours }, dayName, period, s2Constraint)) return false;
    }
    return { availableRoom };
}

function generateSchedule(subjects, allStaff, globalStaffBookings, globalRoomBookings, globalStaffHours, allConstraints, semester, academicYear) {

    // ── Initialise a grid: dayName → slots[] ─────────────────────────────────
    const grid = {};
    for (const dayName of DAYS) {
        grid[dayName] = PERIODS.map((p) => ({
            ...p,
            subject:    '',
            staffId:    undefined,
            staffName:    '',
            staff2Id:     undefined,
            staff2Name:   '',
            categoryUsed: '',
            classroom:    '',
            type:         'free',
        }));
    }

    // Helper: look up a staff member's constraint doc (used in Phase 1 - labs)
    const getConstraint = (staffIdStr) =>
        allConstraints.find(
            (c) =>
                c.staffId.toString() === staffIdStr &&
                c.semester === semester &&
                c.academicYear === academicYear
        );

    // ── Separate subjects into labs and theory ─────────────────────────────────
    const labSubjects = [];
    const theorySubjects = [];

    for (const sub of subjects) {
        // findStaffForSubject returns [{ staff, preference }] already sorted asc
        const candidates = findStaffForSubject(sub, allStaff);
        if (sub.type === 'lab') {
            // Institutional rule: Major labs are 4 periods (LAB_BLOCK). 
            // Minor sessions (1-2 hours) take only their actual hours to save slots.
            const currentBlockSize = sub.hoursPerWeek < LAB_BLOCK ? sub.hoursPerWeek : LAB_BLOCK;
            const blocksNeeded = Math.max(1, Math.floor(sub.hoursPerWeek / currentBlockSize));
            
            labSubjects.push({ 
                name: sub.name, 
                code: sub.code, 
                hours: sub.hoursPerWeek,
                blockSize: currentBlockSize,
                blocksNeeded, 
                candidates 
            });
        } else {
            theorySubjects.push({ 
                name: sub.name, 
                code: sub.code, 
                hoursNeeded: sub.hoursPerWeek, 
                candidates 
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1 — LAB ALLOCATION (PRIORITY)
    //
    // • Labs placed BEFORE theory to reserve widest slot pool
    // • Each block occupies LAB_BLOCK (4) CONSECUTIVE free periods
    // • TWO distinct constraint-valid staff assigned per block
    // • dayLabCount biases day selection so all 5 days are used evenly
    //   → fixes the Thursday/Friday empty-day problem
    // • Fallback: 1 staff + staff2Name='TBD' when no valid pair exists
    // ══════════════════════════════════════════════════════════════════════════

    // Track lab-block count per day to enable even distribution
    const dayLabCount = {};
    DAYS.forEach(d => { dayLabCount[d] = 0; });

    // Returns days sorted: least-loaded first, shuffled within ties
    function leastBusyDaysOrder() {
        const minCount = Math.min(...Object.values(dayLabCount));
        const least = DAYS.filter(d => dayLabCount[d] === minCount);
        const rest  = DAYS.filter(d => dayLabCount[d] >  minCount);
        return [...shuffle(least), ...shuffle(rest)];
    }

    for (const lab of labSubjects) {
        const staffList = groupAndShuffleByPreference(lab.candidates);

        for (let block = 0; block < lab.blocksNeeded; block++) {
            let blockAssigned = false;

            dayLoop:
            for (const dayName of leastBusyDaysOrder()) {
                const daySlots = grid[dayName];

                // Iterate over start indices that can accommodate the dynamic blockSize
                const maxStart = PERIODS.length - lab.blockSize;
                const availableStartIndices = Array.from({ length: maxStart + 1 }, (_, i) => i);

                for (const startIdx of shuffle(availableStartIndices)) {
                    const blockIdx = Array.from({ length: lab.blockSize }, (_, i) => startIdx + i);

                    // All required slots must be free
                    if (blockIdx.some(i => daySlots[i].type !== 'free')) continue;

                    // ── ATTEMPT 1: Pair matching with priority logic ──────
                    // Pairing Order: Class A+A > Class A+B > Class B+B
                    const sortedPairs = [];
                    for (let i = 0; i < staffList.length; i++) {
                        for (let j = i + 1; j < staffList.length; j++) {
                            const s1 = staffList[i].staff;
                            const s2 = staffList[j].staff;
                            const cat1 = s1.category || 'B';
                            const cat2 = s2.category || 'B';
                            
                            let priority = 3; // Default B+B
                            if (cat1 === 'A' && cat2 === 'A') priority = 1;
                            else if (cat1 === 'A' || cat2 === 'A') priority = 2;
                            
                            sortedPairs.push({ s1, s2, priority });
                        }
                    }
                    sortedPairs.sort((a, b) => a.priority - b.priority);

                    pairSearch:
                    for (const { s1, s2, priority } of sortedPairs) {
                        const s1Id = s1._id.toString();
                        const s2Id = s2._id.toString();
                        const s1Con = getConstraint(s1Id);
                        const s2Con = getConstraint(s2Id);
                        const s1Hours = globalStaffHours[s1Id] || 0;
                        const s2Hours = globalStaffHours[s2Id] || 0;

                        const result = isValidForTwoStaff(
                            s1Id, s2Id, s1Con, s2Con, s1Hours, s2Hours,
                            dayName, blockIdx, globalStaffBookings, globalRoomBookings
                        );
                        if (!result) continue;

                        const { availableRoom } = result;
                        const categoryUsed = priority === 1 ? 'A+A' : priority === 2 ? 'A+B' : 'B+B';

                        // ✔ Valid pair found
                        for (const idx of blockIdx) {
                            daySlots[idx].subject      = lab.name;
                            daySlots[idx].type         = 'lab';
                            daySlots[idx].staffId      = s1._id;
                            daySlots[idx].staffName    = s1.name;
                            daySlots[idx].staff2Id     = s2._id;
                            daySlots[idx].staff2Name   = s2.name;
                            daySlots[idx].categoryUsed = categoryUsed;
                            daySlots[idx].classroom    = availableRoom;
                            bookStaff(s1Id, dayName, idx, globalStaffBookings);
                            bookStaff(s2Id, dayName, idx, globalStaffBookings);
                            bookRoom(availableRoom, dayName, idx, globalRoomBookings);
                        }
                        globalStaffHours[s1Id] = s1Hours + lab.blockSize;
                        globalStaffHours[s2Id] = s2Hours + lab.blockSize;
                        dayLabCount[dayName]++;
                        blockAssigned = true;
                        console.log(`[Lab] ✔ "${lab.name}" block ${block+1} (${lab.blockSize}hrs) → ${dayName} | ${s1.name} + ${s2.name} (${categoryUsed})`);
                        break pairSearch;
                    }

                    if (blockAssigned) break dayLoop;

                    // ── ATTEMPT 2: Fallback — 1 staff + staff2Name='TBD' ────
                    for (const { staff: fs } of staffList) {
                        const fsId    = fs._id.toString();
                        const fsCon   = getConstraint(fsId);
                        const fsHours = globalStaffHours[fsId] || 0;
                        let valid = true;

                        const availableRoom = ROOM_POOL.lab.find(r => 
                            blockIdx.every(idx => isRoomAvailable(r, dayName, idx, globalRoomBookings))
                        );
                        if (!availableRoom) continue;

                        for (const idx of blockIdx) {
                            if (!isStaffAvailable(fsId, dayName, idx, globalStaffBookings)) { valid = false; break; }
                            if (!checkConstraints({ hours: fsHours }, dayName, PERIODS[idx].period, fsCon)) { valid = false; break; }
                        }
                        if (valid) {
                            for (const idx of blockIdx) {
                                daySlots[idx].subject      = lab.name;
                                daySlots[idx].type         = 'lab';
                                daySlots[idx].staffId      = fs._id;
                                daySlots[idx].staffName    = fs.name;
                                daySlots[idx].staff2Id     = null;
                                daySlots[idx].staff2Name   = 'TBD';
                                daySlots[idx].categoryUsed = fs.category || 'B';
                                daySlots[idx].classroom    = availableRoom;
                                bookStaff(fsId, dayName, idx, globalStaffBookings);
                                bookRoom(availableRoom, dayName, idx, globalRoomBookings);
                            }
                            globalStaffHours[fsId] = fsHours + lab.blockSize;
                            dayLabCount[dayName]++;
                            blockAssigned = true;
                            console.warn(
                                `[Lab] ⚠ "${lab.name}" block ${block+1} (${lab.blockSize}hrs): no valid pair found` +
                                ` — single staff "${fs.name}", staff2='TBD'`
                            );
                            break dayLoop;
                        }
                    }
                    if (blockAssigned) break dayLoop;

                    // ── ATTEMPT 3: Absolute Fallback — TBD / TBD ───────────
                    //    If NO staff match or are available, place lab anyway
                    //    so the 4-hour block is reserved.
                    const fallbackRoom = ROOM_POOL.lab.find(r => 
                        blockIdx.every(idx => isRoomAvailable(r, dayName, idx, globalRoomBookings))
                    );
                    if (fallbackRoom) {
                        for (const idx of blockIdx) {
                            daySlots[idx].subject      = lab.name;
                            daySlots[idx].type         = 'lab';
                            daySlots[idx].staffId      = null;
                            daySlots[idx].staffName    = 'TBD';
                            daySlots[idx].staff2Id     = null;
                            daySlots[idx].staff2Name   = 'TBD';
                            daySlots[idx].categoryUsed = 'N/A';
                            daySlots[idx].classroom    = fallbackRoom;
                            bookRoom(fallbackRoom, dayName, idx, globalRoomBookings);
                        }
                        dayLabCount[dayName]++;
                        blockAssigned = true;
                        console.warn(
                            `[Lab] ✖ "${lab.name}" block ${block+1} (${lab.blockSize}hrs): zero staff matched — staff1=TBD, staff2=TBD`
                        );
                        break dayLoop;
                    }
                }
            }

            if (!blockAssigned) {
                console.warn(
                    `[Lab] ✖ "${lab.name}" block ${block+1}/${lab.blocksNeeded}:` +
                    ` no suitable slot on ANY day — skipped.`
                );
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2 — Theory: CSP Backtracking Solver
    // ══════════════════════════════════════════════════════════════════════════
    allocateTheoryCSP(
        theorySubjects,
        grid,
        globalStaffBookings,
        globalRoomBookings,
        globalStaffHours,
        allStaff,
        allConstraints,
        semester,
        academicYear
    );

    // ── Build final schedule in Monday→Friday order ────────────────────────────
    // DAYS constant is already in Mon→Fri order so no extra sort needed
    return DAYS.map((dayName) => ({ day: dayName, slots: grid[dayName] }));
}



/**
 * @desc    Bulk generate timetables for even or odd semesters
 * @route   POST /api/curriculum/generate
 * @access  Manager
 * @body    { title: String, type: 'even' | 'odd', department: String }
 */
export const generateBulkTimetables = async (req, res, next) => {
    try {
        const { title, department, semesterType } = req.body;

        if (!department) {
            return res.status(400).json({ message: 'Department must be selected.' });
        }
        if (!semesterType || !['odd', 'even'].includes(semesterType)) {
            return res.status(400).json({ message: 'Semester type must be selected (Odd/Even).' });
        }

        const semestersToProcess = semesterType === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

        // Fetch all active staff
        const allStaff = await User.find({
            role: 'staff',
            isActive: true,
        }).select('_id name subjects department category');

        // Fetch all constraints
        const allConstraints = await Constraint.find({});

        /**
         * GLOBAL TRACKING
         * Shared across ALL semesters to prevent cross-year clashes.
         * Now also includes room tracking and loads existing data from DB.
         */
        const globalStaffBookings = new Set();
        const globalRoomBookings  = new Set();
        const globalStaffHours    = {};
        allStaff.forEach(s => globalStaffHours[s._id.toString()] = 0);

        // Pre-load from DB (Academic Year usually from first curriculum or common config)
        // For bulk, we'll use the year from the first semester processed or a default.
        const exampleCurriculum = await Curriculum.findOne({ semester: semestersToProcess[0] });
        if (exampleCurriculum) {
            await loadExistingBookings(exampleCurriculum.academicYear, globalStaffBookings, globalRoomBookings, globalStaffHours);
        }

        const summary = {
            generatedCount: 0,
            semestersProcessed: [],
            errors: []
        };

        for (const semester of semestersToProcess) {
            console.log(`[Generator] Processing Semester ${semester}...`);
            const curriculum = await Curriculum.findOne({ semester });
            
            if (!curriculum) {
                console.log(`[Generator] Skipping Semester ${semester}: No curriculum defined.`);
                continue;
            }

            console.log(`[Generator] Found curriculum for Sem ${semester} with ${curriculum.subjects?.length} subjects.`);

            const sectionLabels = Array.from({ length: curriculum.sections || 1 }, (_, i) =>
                String.fromCharCode(65 + i)
            );

            const ttTitleBase = title || `Timetable - ${semesterType.toUpperCase()}`;

            for (const section of sectionLabels) {
                try {
                    console.log(`[Generator] Generating schedule for Sem ${semester} Section ${section}...`);
                    const schedule = generateSchedule(
                        curriculum.subjects,
                        allStaff,
                        globalStaffBookings,
                        globalRoomBookings,
                        globalStaffHours,
                        allConstraints,
                        curriculum.semester,
                        curriculum.academicYear
                    );
                    
                    console.log(`[Generator] Schedule generated for Sem ${semester} Section ${section}. Saving to DB...`);

                    const year = Math.ceil(curriculum.semester / 2);
                    const ttTitle = `${ttTitleBase} - Year ${year} - Sem ${curriculum.semester} - Section ${section}`;

                    const filter = {
                        department,
                        semester: curriculum.semester,
                        section,
                        academicYear: curriculum.academicYear,
                    };

                    const update = {
                        title: ttTitle,
                        department,
                        semester: curriculum.semester,
                        section,
                        academicYear: curriculum.academicYear,
                        schedule,
                        createdBy: req.user._id,
                    };

                    const result = await TimeTable.findOneAndUpdate(filter, update, { upsert: true, new: true, runValidators: true });
                    console.log(`[Generator] Timetable saved successfully: ${result._id}`);
                    summary.generatedCount++;
                } catch (err) {
                    console.error(`[Generator] Error in Sem ${semester} Section ${section}:`, err);
                    summary.errors.push({ semester, section, error: err.message });
                }
            }
            summary.semestersProcessed.push(semester);
        }

        console.log(`[Generator] Bulk generation finished. Total generated: ${summary.generatedCount}`);
        res.json({
            message: `Timetable generation complete. Generated ${summary.generatedCount} timetables across semesters: ${summary.semestersProcessed.join(', ')}.`,
            summary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate timetable for a single specific semester
 * @route   POST /api/curriculum/generate/:semester
 * @access  Admin, Manager
 * @body    { title: String, department: String }
 */
export const generateSingleSemesterTimetable = async (req, res, next) => {
    try {
        const semester = Number(req.params.semester);
        const { title, department } = req.body;

        if (!semester || semester < 1 || semester > 8) {
            return res.status(400).json({ message: 'Semester must be a number between 1 and 8.' });
        }
        if (!title || !department) {
            return res.status(400).json({ message: 'Title and department are required.' });
        }

        // Fetch the curriculum for this specific semester
        const curriculum = await Curriculum.findOne({ semester });
        if (!curriculum) {
            return res.status(404).json({
                message: `No curriculum defined for Semester ${semester}. Please add subjects first.`,
            });
        }

        // Fetch all active staff
        const allStaff = await User.find({ role: 'staff', isActive: true })
            .select('_id name subjects department');

        // Fetch all constraints
        const allConstraints = await Constraint.find({});

        // Shared bookings across sections of this semester (prevents intra-semester double-booking)
        const globalStaffBookings = new Set();
        const globalRoomBookings  = new Set();
        const globalStaffHours    = {};
        allStaff.forEach(s => { globalStaffHours[s._id.toString()] = 0; });

        // Load existing to prevent clashes with other semesters
        await loadExistingBookings(curriculum.academicYear, globalStaffBookings, globalRoomBookings, globalStaffHours);

        const sectionLabels = Array.from({ length: curriculum.sections }, (_, i) =>
            String.fromCharCode(65 + i)   // 'A', 'B', 'C', ...
        );

        const created = [];
        const errors  = [];

        for (const section of sectionLabels) {
            try {
                const schedule = generateSchedule(
                    curriculum.subjects,
                    allStaff,
                    globalStaffBookings,
                    globalRoomBookings,
                    globalStaffHours,
                    allConstraints,
                    curriculum.semester,
                    curriculum.academicYear
                );

                const year    = Math.ceil(curriculum.semester / 2);
                const ttTitle = `${title} - Year ${year} - Sem ${curriculum.semester} - Section ${section}`;

                // Upsert: update if already exists, create otherwise
                const existing = await TimeTable.findOne({
                    department,
                    semester: curriculum.semester,
                    section,
                    academicYear: curriculum.academicYear,
                });

                if (existing) {
                    existing.title    = ttTitle;
                    existing.schedule = schedule;
                    await existing.save();
                    created.push({ id: existing._id, title: ttTitle, section, action: 'updated' });
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
                    created.push({ id: timetable._id, title: ttTitle, section, action: 'created' });
                }
            } catch (err) {
                errors.push({ section, error: err.message });
            }
        }

        res.json({
            message: `Timetable generation complete for Semester ${semester}.`,
            semester,
            academicYear: curriculum.academicYear,
            sections: sectionLabels,
            created,
            errors,
        });
    } catch (error) {
        next(error);
    }
};
