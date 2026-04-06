import mongoose from 'mongoose';

const ConstraintSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  avoidDays: [String],
  avoidSlots: [
    {
      day: String,
      period: Number
    }
  ],
  avoidPeriods: [Number],
  maxHours: {
    type: Number,
    default: 17
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a staff member only has one constraint set per semester + academic year
ConstraintSchema.index({ staffId: 1, academicYear: 1, semester: 1 }, { unique: true });

const Constraint = mongoose.model('Constraint', ConstraintSchema);
export default Constraint;
