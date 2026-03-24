import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MasterSubject from './src/models/MasterSubject.js';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const subjects = [
  { name: 'Discrete Mathematics', code: '22MYB05', type: 'theory', credits: 4, hoursPerWeek: 4 },
  { name: 'Java programming', code: '22AIC04', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Artificial intelligence', code: '22AIC05', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Algorithms', code: '22AIC06', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Data Exploration and Visualization', code: '22AIC07', type: 'theory', credits: 4, hoursPerWeek: 5 },
  { name: 'Java programming Laboratory', code: '22AIP03', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Artificial intelligence Laboratory', code: '22AIP04', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Algorithms Laboratory', code: '22AIP05', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Soft / Analytical Skills - II', code: '22MAN04R', type: 'theory', credits: 0, hoursPerWeek: 3 },
  { name: 'Indian Constitution', code: '22MAN09', type: 'theory', credits: 0, hoursPerWeek: 1 }
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

        console.log("Updating Semester 3 in Curriculum...");
        // Assigning to year 2024-2025 as semester 3 belongs to the 2nd year
        const academicYear = '2024-2025';

        let cur = await Curriculum.findOne({ semester: 3 });
        if (cur) {
            cur.subjects = subjects;
            cur.academicYear = academicYear;
            await cur.save();
        } else {
            cur = await Curriculum.create({
                semester: 3,
                academicYear,
                sections: 1,
                subjects
            });
        }
        
        console.log("Successfully seeded Semester 3 syllabus!");
        process.exit(0);
    } catch (e) {
        console.error("Failed to seed:", e);
        process.exit(1);
    }
};

run();
