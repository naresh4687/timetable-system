import TimeTable from '../models/TimeTable.js';
import Constraint from '../models/Constraint.js';
import { checkConstraints } from '../utils/constraintUtils.js';
import { formatTimeTo12H } from '../utils/timeUtils.js';

/**
 * Validates no staff double-booking, no classroom conflicts, and no constraint violations
 */
const validateSchedule = (schedule, constraintsMap = {}) => {
  const staffSlots = {}; // staffId -> [day+time]
  const classroomSlots = {}; // classroom -> [day+time]

  for (const day of schedule) {
    for (const slot of day.slots) {
      if (slot.type === 'break' || slot.type === 'free') continue;

      const timeKey = `${day.day}-${slot.startTime}`;

      // ── Helper: validate one staff member against bookings + constraints ──
      const validateOneStaff = (staffId, staffName) => {
        if (!staffId) return null;
        const key = `${staffId}-${timeKey}`;
        if (staffSlots[key]) {
          return `Staff ${staffName || staffId} is double-booked on ${day.day} at ${slot.startTime}`;
        }
        staffSlots[key] = true;

        const constraint = constraintsMap[staffId.toString()];
        if (constraint) {
          const pseudoStaff = { hours: 0 };
          if (!checkConstraints(pseudoStaff, day.day, slot.period, constraint)) {
            return `Staff ${staffName || staffId} cannot be assigned to ${day.day} P${slot.period} due to their constraints`;
          }
        }
        return null;
      };

      // Check primary staff
      const err1 = validateOneStaff(slot.staffId, slot.staffName);
      if (err1) return err1;

      // Check secondary staff (lab sessions)
      const err2 = validateOneStaff(slot.staff2Id, slot.staff2Name);
      if (err2) return err2;

      // Check classroom conflict
      if (slot.classroom) {
        const key = `${slot.classroom}-${timeKey}`;
        if (classroomSlots[key]) {
          return `Classroom ${slot.classroom} has a conflict on ${day.day} at ${slot.startTime}`;
        }
        classroomSlots[key] = true;
      }
    }
  }
  return null; // No conflicts
};

/**
 * @desc    Create timetable
 * @route   POST /api/timetables
 * @access  Admin, Manager
 */
export const createTimetable = async (req, res, next) => {
  try {
    const { title, department, semester, section, academicYear, schedule } = req.body;

    if (!title || !department || !semester || !academicYear) {
      return res.status(400).json({ message: 'Title, department, semester, and academicYear are required.' });
    }

    // Validate schedule for conflicts
    if (schedule && schedule.length > 0) {
      // Find all staff involved
      const staffIds = new Set();
      schedule.forEach(day => day.slots.forEach(slot => { if (slot.staffId) staffIds.add(slot.staffId) }));
      
      const constraints = await Constraint.find({
        staffId: { $in: Array.from(staffIds) },
        academicYear,
        semester
      });
      const constraintsMap = {};
      constraints.forEach(c => { constraintsMap[c.staffId.toString()] = c });

      const conflict = validateSchedule(schedule, constraintsMap);
      if (conflict) {
        return res.status(400).json({ message: `Schedule conflict: ${conflict}` });
      }
    }

    const timetable = await TimeTable.create({
      title,
      department,
      semester,
      section,
      academicYear,
      schedule: schedule || [],
      createdBy: req.user._id,
    });

    await timetable.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Timetable created successfully.', timetable });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all timetables
 * @route   GET /api/timetables
 * @access  All authenticated
 */
export const getAllTimetables = async (req, res, next) => {
  try {
    const { department, semester, academicYear } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = new RegExp(department, 'i');
    if (semester) filter.semester = Number(semester);
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await TimeTable.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ timetables });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single timetable
 * @route   GET /api/timetables/:id
 * @access  All authenticated
 */
export const getTimetableById = async (req, res, next) => {
  try {
    const timetable = await TimeTable.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('schedule.slots.staffId', 'name email department');

    if (!timetable) return res.status(404).json({ message: 'Timetable not found.' });
    res.json({ timetable });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update timetable
 * @route   PUT /api/timetables/:id
 * @access  Admin, Manager
 */
export const updateTimetable = async (req, res, next) => {
  try {
    const { title, department, semester, section, academicYear, schedule, isActive } = req.body;

    // Validate schedule conflicts before updating
    if (schedule && schedule.length > 0) {
      const staffIds = new Set();
      schedule.forEach(day => day.slots.forEach(slot => { if (slot.staffId) staffIds.add(slot.staffId) }));
      
      let currentAcadYear = academicYear;
      let currentSemester = semester;
      
      if (!currentAcadYear || !currentSemester) {
         const existingTT = await TimeTable.findById(req.params.id);
         if (existingTT) {
             currentAcadYear = currentAcadYear || existingTT.academicYear;
             currentSemester = currentSemester || existingTT.semester;
         }
      }

      const constraints = await Constraint.find({
        staffId: { $in: Array.from(staffIds) },
        academicYear: currentAcadYear,
        semester: currentSemester
      });
      const constraintsMap = {};
      constraints.forEach(c => { constraintsMap[c.staffId.toString()] = c });

      const conflict = validateSchedule(schedule, constraintsMap);
      if (conflict) {
        return res.status(400).json({ message: `Schedule conflict: ${conflict}` });
      }
    }

    const timetable = await TimeTable.findByIdAndUpdate(
      req.params.id,
      { title, department, semester, section, academicYear, schedule, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({ message: 'Timetable updated successfully.', timetable });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update timetable status (Approve/Reject)
 * @route   PATCH /api/timetables/:id/status
 * @access  Admin, Manager
 */
export const updateTimetableStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['draft', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const timetable = await TimeTable.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason : '' },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!timetable) return res.status(404).json({ message: 'Timetable not found.' });
    
    res.json({ message: `Timetable marked as ${status}.`, timetable });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete timetable
 * @route   DELETE /api/timetables/:id
 * @access  Admin only
 */
export const deleteTimetable = async (req, res, next) => {
  try {
    const timetable = await TimeTable.findByIdAndDelete(req.params.id);
    if (!timetable) return res.status(404).json({ message: 'Timetable not found.' });
    res.json({ message: 'Timetable deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download timetable as PDF (Premium Institutional Layout)
 * @route   GET /api/timetables/:id/pdf
 * @access  All authenticated
 */
export const downloadTimetablePDF = async (req, res, next) => {
  try {
    const timetable = await TimeTable.findById(req.params.id).populate(
      'schedule.slots.staffId',
      'name'
    );

    if (!timetable) return res.status(404).json({ message: 'Timetable not found.' });

    const PDFDocument = (await import('pdfkit')).default;
    // Landscape A4 for maximum grid width
    const doc = new PDFDocument({ 
      margin: 30, 
      size: 'A4', 
      layout: 'landscape',
      info: {
        Title: timetable.title,
        Author: 'TimeTable Allocation System',
        Subject: `${timetable.department} - Semester ${timetable.semester}`
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="REGISTER-${timetable.department}-S${timetable.semester}.pdf"`
    );

    doc.pipe(res);

    // ── Pre-Calculated Dimensions ──
    const pageWidth = 841.89; // A4 Landscape width in points
    const pageHeight = 595.28;
    const margin = 30;
    const innerWidth = pageWidth - (margin * 2);
    
    // Grid settings
    const dayColWidth = 70;
    const slotCount = timetable.schedule[0]?.slots.length || 7;
    const colWidth = (innerWidth - dayColWidth) / slotCount;
    const rowHeight = 45;
    const headerHeight = 50;

    // ── BRANDING HEADER ──
    // Draw top accent bar
    doc.rect(0, 0, pageWidth, 5).fill('#FF3B3B');
    
    doc.fillColor('#0F0F0F').font('Helvetica-Bold').fontSize(24).text('INSTITUTIONAL REGISTRY', margin, 35, { characterSpacing: 2 });
    doc.fillColor('#FF3B3B').font('Helvetica-Bold').fontSize(10).text('TIMETABLE ALLOCATION SYSTEM', margin, 62, { characterSpacing: 3 });
    
    // Metadata Box
    const metaX = margin + 450;
    doc.rect(metaX, 35, innerWidth - 450, 45).fill('#F9FAFB');
    doc.fillColor('#0F0F0F').font('Helvetica-Bold').fontSize(12).text(timetable.title.toUpperCase(), metaX + 10, 42);
    doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(8).text(`DEPT: ${timetable.department} | SEM: ${timetable.semester} | SEC: ${timetable.section} | YEAR: ${timetable.academicYear}`, metaX + 10, 58);

    doc.moveDown(4);

    // ── GRID CONSTRUCTION ──
    let currentY = doc.y + 10;

    // Draw Period Headers
    doc.rect(margin, currentY, innerWidth, headerHeight).fill('#0F0F0F');
    
    // Day Label Cell (Header)
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('PERIODS', margin + 10, currentY + 18);
    doc.fontSize(7).text('WORKING DAYS', margin + 10, currentY + 30, { opacity: 0.5 });

    const periods = timetable.schedule[0]?.slots || [];
    periods.forEach((slot, i) => {
      const x = margin + dayColWidth + (i * colWidth);
      
      // Period Number
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text(`P${slot.period}`, x, currentY + 14, { width: colWidth, align: 'center' });
      // Time Range
      doc.fillColor('#FFFFFF').font('Helvetica-Oblique').fontSize(7).text(`${formatTimeTo12H(slot.startTime)} - ${formatTimeTo12H(slot.endTime)}`, x, currentY + 28, { width: colWidth, align: 'center', opacity: 0.6 });
      
      // Vertical separator line in header
      if (i > 0) {
        doc.lineWidth(0.1).strokeColor('#333333').moveTo(x, currentY + 10).lineTo(x, currentY + 40).stroke();
      }
    });

    currentY += headerHeight;

    // Draw Day Rows
    timetable.schedule.forEach((day, rowIdx) => {
      const rowY = currentY + (rowIdx * rowHeight);
      
      // Zebra striping
      if (rowIdx % 2 === 1) {
        doc.rect(margin, rowY, innerWidth, rowHeight).fill('#F9FAFB');
      }

      // Day Name Column
      doc.fillColor('#0F0F0F').font('Helvetica-Bold').fontSize(10).text(day.day.toUpperCase(), margin + 10, rowY + 18);
      
      // Slots
      day.slots.forEach((slot, i) => {
        const x = margin + dayColWidth + (i * colWidth);
        const padding = 5;

        // Draw node content
        if (slot.type === 'break') {
          doc.fillColor('#F1F5F9').rect(x + 2, rowY + 2, colWidth - 4, rowHeight - 4).fill();
          doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(7).text('BREAK / HIATUS', x, rowY + rowHeight/2 - 3, { width: colWidth, align: 'center' });
        } else if (slot.type === 'free' || !slot.subject) {
          doc.fillColor('#FDFDFD').rect(x + 2, rowY + 2, colWidth - 4, rowHeight - 4).fill();
        } else {
          // Highlight active slots
          const borderHighlight = slot.type === 'lab' ? '#FF8C00' : '#FF3B3B';
          doc.lineWidth(0.5).strokeColor('#e2e8f0').rect(x + 2, rowY + 2, colWidth - 4, rowHeight - 4).stroke();
          
          // Subject
          doc.fillColor('#0F0F0F').font('Helvetica-Bold').fontSize(8).text(slot.subject.toUpperCase(), x + padding, rowY + 10, { width: colWidth - (padding * 2), height: 18, ellipsis: true });
          
          // Staff
          doc.fillColor('#64748b').font('Helvetica').fontSize(7).text(slot.staffName || 'UNASSIGNED', x + padding, rowY + 24, { width: colWidth - (padding * 2) });
          
          // Classroom
          if (slot.classroom) {
            doc.fillColor('#FF3B3B').font('Helvetica-Bold').fontSize(6).text(`LOC: ${slot.classroom}`, x + padding, rowY + 34);
          }
        }

        // Horizontal line
        doc.lineWidth(0.1).strokeColor('#E5E7EB').moveTo(margin, rowY + rowHeight).lineTo(margin + innerWidth, rowY + rowHeight).stroke();
      });
    });

    // ── FOOTER AUTHENTICATION ──
    const footerY = currentY + (timetable.schedule.length * rowHeight) + 40;
    
    doc.lineWidth(0.5).strokeColor('#0F0F0F').moveTo(margin, footerY).lineTo(margin + 200, footerY).stroke();
    doc.fillColor('#0F0F0F').font('Helvetica-Bold').fontSize(8).text('AUTHORIZED SIGNATORY/STAMP', margin, footerY + 8);
    
    doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(8).text(`Document synchronized via Institutional Registry Cluster. Node: ${req.user.name}. Timestamp: ${new Date().toISOString()}`, margin, footerY + 30, { align: 'right', width: innerWidth });

    // Final Page Border
    doc.lineWidth(0.5).strokeColor('#F1F5F9').rect(10, 10, pageWidth - 20, pageHeight - 20).stroke();

    doc.end();
  } catch (error) {
    next(error);
  }
};
