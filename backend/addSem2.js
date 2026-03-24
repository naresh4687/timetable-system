import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MasterSubject from './src/models/MasterSubject.js';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const subjects = [
  { name: 'Professional Communication - II', code: '22EYA02', type: 'theory', credits: 3, hoursPerWeek: 4 },
  { name: 'Statistics and Numerical Methods', code: '22MYB03', type: 'theory', credits: 4, hoursPerWeek: 4 },
  { name: 'Data Structures using C', code: '22AIC01', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Python Programming', code: '22AIC02', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Digital Principles and Computer Organization', code: '22AIC03', type: 'theory', credits: 3, hoursPerWeek: 3 },
  { name: 'Tamils and Technology', code: '22GYA02', type: 'theory', credits: 1, hoursPerWeek: 1 },
  { name: 'Data Structures Laboratory', code: '22AIP01', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Python Programming Laboratory', code: '22AIP02', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Engineering Graphics Laboratory', code: '22MEP01', type: 'lab', credits: 2, hoursPerWeek: 4 },
  { name: 'Soft / Analytical Skills - I', code: '22MAN02R', type: 'theory', credits: 0, hoursPerWeek: 3 },
  { name: 'Yoga - II', code: '22MAN05', type: 'lab', credits: 0, hoursPerWeek: 1 }
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

        console.log("Updating Semester 2 in Curriculum...");
        // Assigning to year 2023-2024 as semester 2 belongs to the 1st year
        const academicYear = '2023-2024';

        let cur = await Curriculum.findOne({ semester: 2 });
        if (cur) {
            cur.subjects = subjects;
            cur.academicYear = academicYear;
            await cur.save();
        } else {
            cur = await Curriculum.create({
                semester: 2,
                academicYear,
                sections: 1, // Defaulting to 1 section, can be configured in UI
                subjects
            });
        }
        
        console.log("Successfully seeded Semester 2 syllabus!");
        process.exit(0);
    } catch (e) {
        console.error("Failed to seed:", e);
        process.exit(1);
    }
};

run();
