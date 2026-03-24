import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const data = [
  {
    semester: 1,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22MAN01', name: 'Induction Programme', type: 'theory', credits: 0, hoursPerWeek: 0 },
      { code: '22EYA01', name: 'Professional Communication - I', type: 'theory', credits: 3, hoursPerWeek: 4 },
      { code: '22MYB01', name: 'Calculus and Linear Algebra', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22PYB01', name: 'Semiconductor Physics', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22CSC01', name: 'Problem Solving and C Programming', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22ECC01', name: 'Basics of Electronics Engineering', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22GYA01', name: 'Heritage of Tamils', type: 'theory', credits: 1, hoursPerWeek: 1 },
      { code: '22PYP01', name: 'Physics Laboratory', type: 'lab', credits: 1, hoursPerWeek: 2 },
      { code: '22CSP01', name: 'Problem Solving and C Programming Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22ECP01', name: 'Basics of Electronics Engineering Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MAN03', name: 'Yoga - I', type: 'lab', credits: 0, hoursPerWeek: 1 }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable')
  .then(async () => {
    console.log('Connected to DB');
    for (const semData of data) {
      await Curriculum.findOneAndUpdate(
        { semester: semData.semester },
        semData,
        { upsert: true, new: true }
      );
      console.log(`Saved Semester ${semData.semester}`);
    }
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
