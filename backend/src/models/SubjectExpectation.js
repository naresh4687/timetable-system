import mongoose from 'mongoose';

/**
 * SubjectExpectation Schema
 * Staff submit their preferred subjects to teach
 */
const subjectExpectationSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one expectation per staff
    },
    staffName: {
      type: String,
    },
    department: {
      type: String,
      trim: true,
    },
    preferredTheorySubjects: {
      type: [
        {
          subject: { type: String, required: true },
          semester: { type: Number, required: true },
          section: { type: String, required: true },
        }
      ],
      validate: {
        validator: function (arr) {
          return arr.length <= 3;
        },
        message: 'Maximum 3 theory subjects allowed',
      },
    },
    preferredLabSubject: {
      type: String,
      default: null,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    semesterType: {
      type: String,
      enum: ['odd', 'even'],
      default: null,
    },
    semester: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const SubjectExpectation = mongoose.model('SubjectExpectation', subjectExpectationSchema);
export default SubjectExpectation;
