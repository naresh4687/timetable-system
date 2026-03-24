import TimeTable from '../models/TimeTable.js';

/**
 * Validates no staff double-booking and no classroom conflicts
 */
const validateSchedule = (schedule) => {
  const staffSlots = {}; // staffId -> [day+time]
  const classroomSlots = {}; // classroom -> [day+time]

  for (const day of schedule) {
    for (const slot of day.slots) {
      if (slot.type === 'break' || slot.type === 'free') continue;

      const timeKey = `${day.day}-${slot.startTime}`;

      // Check staff double-booking
      if (slot.staffId) {
        const key = `${slot.staffId}-${timeKey}`;
        if (staffSlots[key]) {
          return `Staff ${slot.staffName || slot.staffId} is double-booked on ${day.day} at ${slot.startTime}`;
        }
        staffSlots[key] = true;
      }

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
      const conflict = validateSchedule(schedule);
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
      const conflict = validateSchedule(schedule);
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
 * @desc    Download timetable as PDF
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
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="timetable-${timetable.department}-sem${timetable.semester}.pdf"`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('TIMETABLE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text(timetable.title, { align: 'center' });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .text(
        `Department: ${timetable.department} | Semester: ${timetable.semester} | Section: ${timetable.section} | Academic Year: ${timetable.academicYear}`,
        { align: 'center' }
      );
    doc.moveDown(1);

    // Table drawing
    const days = timetable.schedule;
    const allSlots = days[0]?.slots || [];
    const colWidth = 100;
    const rowHeight = 40;
    const startX = 40;
    let currentY = doc.y;

    // Draw header row
    doc.fontSize(9).font('Helvetica-Bold');
    doc.rect(startX, currentY, 80, rowHeight).fillAndStroke('#1e3a5f', '#000');
    doc.fillColor('#ffffff').text('Day / Period', startX + 5, currentY + 14, { width: 70 });

    allSlots.forEach((slot, i) => {
      const x = startX + 80 + i * colWidth;
      doc.rect(x, currentY, colWidth, rowHeight).fillAndStroke('#1e3a5f', '#000');
      doc
        .fillColor('#ffffff')
        .text(`P${slot.period}\n${slot.startTime}-${slot.endTime}`, x + 5, currentY + 8, {
          width: colWidth - 10,
        });
    });
    currentY += rowHeight;

    // Draw data rows
    days.forEach((day, rowIdx) => {
      const bgColor = rowIdx % 2 === 0 ? '#f0f4f8' : '#ffffff';
      doc.rect(startX, currentY, 80, rowHeight).fillAndStroke(bgColor, '#ccc');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e3a5f').text(day.day, startX + 5, currentY + 14, { width: 70 });

      day.slots.forEach((slot, i) => {
        const x = startX + 80 + i * colWidth;
        const bg = slot.type === 'break' ? '#fef3c7' : bgColor;
        doc.rect(x, currentY, colWidth, rowHeight).fillAndStroke(bg, '#ccc');

        const text =
          slot.type === 'break'
            ? 'BREAK'
            : slot.type === 'free'
            ? 'FREE'
            : `${slot.subject || '-'}\n${slot.staffName || ''}`;

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#333')
          .text(text, x + 3, currentY + 6, { width: colWidth - 6, height: rowHeight - 8 });
      });
      currentY += rowHeight;
    });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor('#666')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.end();
  } catch (error) {
    next(error);
  }
};
