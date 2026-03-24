import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const sampleCurricula = [
  // 2023-2024
  {
    semester: 1,
    academicYear: '2023-2024',
    sections: 2,
    subjects: [
      { name: 'Mathematics I', code: 'MAT101', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Physics', code: 'PHY101', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Physics Lab', code: 'PHY102', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  {
    semester: 2,
    academicYear: '2023-2024',
    sections: 2,
    subjects: [
      { name: 'Mathematics II', code: 'MAT102', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Chemistry', code: 'CHE101', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Chemistry Lab', code: 'CHE102', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  // 2024-2025
  {
    semester: 3,
    academicYear: '2024-2025',
    sections: 2,
    subjects: [
      { name: 'Data Structures', code: 'CS201', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Digital Logic', code: 'CS202', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Data Structures Lab', code: 'CS203', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  {
    semester: 4,
    academicYear: '2024-2025',
    sections: 2,
    subjects: [
      { name: 'Algorithms', code: 'CS204', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Computer Architecture', code: 'CS205', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Algorithms Lab', code: 'CS206', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  // 2025-2026
  {
    semester: 5,
    academicYear: '2025-2026',
    sections: 2,
    subjects: [
      { name: 'Operating Systems', code: 'CS301', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Database Systems', code: 'CS302', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'OS Lab', code: 'CS303', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  {
    semester: 6,
    academicYear: '2025-2026',
    sections: 2,
    subjects: [
      { name: 'Computer Networks', code: 'CS304', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Software Engineering', code: 'CS305', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Networks Lab', code: 'CS306', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  // 2026-2027
  {
    semester: 7,
    academicYear: '2026-2027',
    sections: 2,
    subjects: [
      { name: 'Machine Learning', code: 'CS401', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Cloud Computing', code: 'CS402', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { name: 'Machine Learning Lab', code: 'CS403', type: 'lab', credits: 1, hoursPerWeek: 2 },
    ],
  },
  {
    semester: 8,
    academicYear: '2026-2027',
    sections: 2,
    subjects: [
      { name: 'Project Phase I', code: 'CS404', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { name: 'Cyber Security', code: 'CS405', type: 'theory', credits: 3, hoursPerWeek: 3 },
    ],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');

    // Delete existing sample semesters 1-8 to avoid duplication issues
    await Curriculum.deleteMany({ semester: { $in: [1, 2, 3, 4, 5, 6, 7, 8] } });
    console.log('Cleared old sample subjects...');

    for (let cur of sampleCurricula) {
      await Curriculum.create(cur);
      console.log(`Inserted sample subjects for Semester ${cur.semester} (${cur.academicYear})`);
    }

    console.log('✅ Subject sample data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
