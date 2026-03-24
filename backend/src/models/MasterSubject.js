import mongoose from 'mongoose';

const masterSubjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    type: { type: String, enum: ['theory', 'lab'], default: 'theory' },
    credits: { type: Number, required: true, min: 0, max: 10 },
    hoursPerWeek: { type: Number, required: true, min: 0, max: 40 },
}, { timestamps: true });

export default mongoose.model('MasterSubject', masterSubjectSchema);
