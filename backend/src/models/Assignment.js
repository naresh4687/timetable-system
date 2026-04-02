import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    assignments: [
      {
        subjectName: {
          type: String,
          required: true,
        },
        facultyName: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'adminApproved', 'managerApproved', 'rejected'],
      default: 'pending',
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    managerRemarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Assignment', assignmentSchema);
