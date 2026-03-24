// This script uses the CORRECT MongoDB URI from .env and forcefully replaces
// all curriculum data using findOneAndUpdate with full subject arrays (including correct types)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

import Curriculum from './src/models/Curriculum.js';

const semesters = [
  {
    semester: 1, academicYear: '2025-2026', sections: 1,
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
      { code: '22MAN03', name: 'Yoga - I', type: 'lab', credits: 0, hoursPerWeek: 1 },
    ]
  },
  {
    semester: 2, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22EYA02', name: 'Professional Communication - II', type: 'theory', credits: 3, hoursPerWeek: 4 },
      { code: '22MYB03', name: 'Statistics and Numerical Methods', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22AIC01', name: 'Data Structures using C', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC02', name: 'Python Programming', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC03', name: 'Digital Principles and Computer Organization', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22GYA02', name: 'Tamils and Technology', type: 'theory', credits: 1, hoursPerWeek: 1 },
      { code: '22AIP01', name: 'Data Structures Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP02', name: 'Python Programming Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MEP01', name: 'Engineering Graphics Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MAN02R', name: 'Soft/Analytical Skills - I', type: 'theory', credits: 0, hoursPerWeek: 3 },
      { code: '22MAN05', name: 'Yoga - II', type: 'lab', credits: 0, hoursPerWeek: 1 },
    ]
  },
  {
    semester: 3, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22MYB05', name: 'Discrete Mathematics', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22AIC04', name: 'Java Programming', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC05', name: 'Artificial Intelligence', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC06', name: 'Algorithms', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC07', name: 'Data Exploration and Visualization', type: 'theory', credits: 4, hoursPerWeek: 5 },
      { code: '22AIP03', name: 'Java Programming Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP04', name: 'Artificial Intelligence Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP05', name: 'Algorithms Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MAN04R', name: 'Soft/Analytical Skills - II', type: 'theory', credits: 0, hoursPerWeek: 3 },
      { code: '22MAN09', name: 'Indian Constitution', type: 'theory', credits: 0, hoursPerWeek: 1 },
    ]
  },
  {
    semester: 4, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22MYB08', name: 'Probability and Statistics', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22CYB07', name: 'Environmental Science and Engineering', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC08', name: 'Operating Systems', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC09', name: 'Database Design and Management', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC10', name: 'Machine Learning', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC11', name: 'Fundamentals of Data Science and Analytics', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIP06', name: 'Database Design and Management Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP07', name: 'Machine Learning Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP08', name: 'Data Science and Analytics Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MAN07R', name: 'Soft/Analytical Skills - III', type: 'theory', credits: 0, hoursPerWeek: 3 },
      { code: '22GED01', name: 'Personality and Character Development', type: 'theory', credits: 0, hoursPerWeek: 1 },
    ]
  },
  {
    semester: 5, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22AIC12', name: 'Computer Networks', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC13', name: 'Deep Learning', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC14', name: 'Internet of Things and its Applications', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E1', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E2', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E3', name: 'Elective (OEC/PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIP09', name: 'Deep Learning Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP10', name: 'IoT and its Applications Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22MAN08R', name: 'Soft/Analytical Skills - IV', type: 'theory', credits: 0, hoursPerWeek: 3 },
    ]
  },
  {
    semester: 6, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22AIC15', name: 'Full Stack Development', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC16', name: 'Big Data Analytics', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E4', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E5', name: 'Elective (OEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E6', name: 'Elective (OEC/PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E7', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIP11', name: 'Big Data Analytics Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
    ]
  },
  {
    semester: 7, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22GEA01', name: 'Universal Human Values', type: 'theory', credits: 2, hoursPerWeek: 2 },
      { code: 'EMI', name: 'Elective - Management', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E8', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E9', name: 'Elective (OEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E10', name: 'Elective (OEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22GED02', name: 'Internship / Industrial Training', type: 'lab', credits: 2, hoursPerWeek: 2 },
    ]
  },
  {
    semester: 8, academicYear: '2025-2026', sections: 1,
    subjects: [
      { code: '22AID01', name: 'Project Work', type: 'lab', credits: 10, hoursPerWeek: 20 },
    ]
  }
];

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable')
  .then(async () => {
    console.log('Connected to:', process.env.MONGODB_URI);
    // Use replaceOne for each semester to force-update everything including subdocuments
    for (const sem of semesters) {
      const result = await Curriculum.replaceOne(
        { semester: sem.semester },
        { ...sem },
        { upsert: true }
      );
      const theoryCount = sem.subjects.filter(s => s.type === 'theory').length;
      const labCount = sem.subjects.filter(s => s.type === 'lab').length;
      console.log(`✅ Sem ${sem.semester}: ${theoryCount} theory, ${labCount} lab (upserted=${result.upsertedCount}, modified=${result.modifiedCount})`);
    }
    // Verify
    const c1 = await Curriculum.findOne({ semester: 1 });
    const theoryCheck = c1.subjects.filter(s => s.type === 'theory').map(s => s.name);
    console.log('\nSem 1 theory subjects:', theoryCheck.join(', '));
    process.exit(0);
  })
  .catch(err => { console.error(err.message); process.exit(1); });
