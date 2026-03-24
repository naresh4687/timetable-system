import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MasterSubject from './src/models/MasterSubject.js';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const subjects = [
  { name: 'Professional Communication - I', code: '22EYA01', type: 'theory', credits: 3, hoursPerWeek: 4 },
  { name: 'Calculus and Linear Algebra', code: '22MYB01', type: 'theory', credits: 4, hoursPerWeek: 4 },
  { name: 'Semiconductor Physics', code: '22PYB01', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Problem Solving and C Programming', code: '22CSC01', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Basics of Electronics Engineering', code: '22ECC01', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Heritage of Tamils', code: '22GYA01', type: 'theory', credits: 1, hoursPerWeek: 1 },
  { name: 'Physics Laboratory', code: '22PYP01', type: 'lab', credits: 1, hoursPerWeek: 2 },
  { name: 'Problem Solving and C Programming Laboratory', code: '22CSP01', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Basics of Electronics Engineering Laboratory', code: '22ECP01', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Yoga - I', code: '22MAN03', type: 'lab', credits: 0, hoursPerWeek: 1 }
];

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');

        console.log("Adding to Master Subjects...");
        for (const sub of subjects) {
            await MasterSubject.findOneAndUpdate(
                { code: sub.code },
                { $set: sub },
                { upsert: true, new: true }
            );
        }

        console.log("Updating Semester 1 in Curriculum...");
        // Since we know sem 1 is 2023-2024 from earlier debugging
        const academicYear = '2023-2024';

        let cur = await Curriculum.findOne({ semester: 1 });
        if (cur) {
            cur.subjects = subjects;
            cur.academicYear = academicYear;
            await cur.save();
        } else {
            cur = await Curriculum.create({
                semester: 1,
                academicYear,
                sections: 2, // Assuming standard sections as defined elsewhere
                subjects
            });
        }
        
        console.log("Successfully seeded Semester 1 syllabus!");
        process.exit(0);
    } catch (e) {
        console.error("Failed to seed:", e);
        process.exit(1);
    }
};

run();
