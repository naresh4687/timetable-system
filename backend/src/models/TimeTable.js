import mongoose from 'mongoose';

/**
 * Time Slot Schema - Individual class period
 */
const timeSlotSchema = new mongoose.Schema({
  period: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g. "09:00"
  },
  endTime: {
    type: String,
    required: true, // e.g. "10:00"
  },
  subject: {
    type: String,
    trim: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  staffName: {
    type: String,
  },
  classroom: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['theory', 'lab', 'break', 'free'],
    default: 'theory',
  },
});

/**
 * Day Schedule Schema
 */
const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true,
  },
  slots: [timeSlotSchema],
});

/**
 * TimeTable Schema
 */
const timetableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Timetable title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true, // e.g. "2024-2025"
    },
    schedule: [dayScheduleSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'rejected'],
      default: 'draft',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TimeTable = mongoose.model('TimeTable', timetableSchema);
export default TimeTable;
