import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Supports roles: admin, manager, staff, student
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'staff', 'student'],
      default: 'staff',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    dob: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    category: {
      type: String,
      enum: ['A', 'B'],
      default: 'B',
      required: true,
    },
    subjects: [
      {
        subjectId: { type: String, trim: true },
        semester: { type: Number },
        section: { type: String, trim: true },
        type: { type: String, enum: ['theory', 'lab'] },
        preference: { type: Number, enum: [1, 2, 3], default: 3 }, // 1: High, 2: Medium, 3: Low
      },
    ],
    handledSemesters: {
      type: [Number],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
