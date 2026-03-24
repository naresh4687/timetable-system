import mongoose from 'mongoose';

/**
 * Subject Schema - Individual subject in a semester curriculum
 */
const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
    },
    code: {
        type: String,
        required: [true, 'Subject code is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['theory', 'lab'],
        default: 'theory',
    },
    credits: {
        type: Number,
        required: [true, 'Credits are required'],
        min: 0,
        max: 10,
    },
    hoursPerWeek: {
        type: Number,
        required: [true, 'Hours per week is required'],
        min: 0,
        max: 40,
    },
});

/**
 * Curriculum Schema
 * Stores the curriculum for each semester (AD&DS department)
 */
const curriculumSchema = new mongoose.Schema(
    {
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: 1,
            max: 8,
            unique: true,
        },
        academicYear: {
            type: String,
            required: [true, 'Academic year is required'],
            trim: true,
        },
        subjects: [subjectSchema],
        sections: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
            max: 10,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    },
    { timestamps: true }
);

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
export default Curriculum;
