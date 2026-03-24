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
  },
  {
    semester: 3,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22MYB05', name: 'Discrete Mathematics', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22AIC04', name: 'Java Programming', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC05', name: 'Artificial Intelligence', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC06', name: 'Algorithms', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC07', name: 'Data Exploration and Visualization', type: 'theory', credits: 4, hoursPerWeek: 5 },
      { code: '22AIP03', name: 'Java Programming Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP04', name: 'Artificial Intelligence Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP05', name: 'Algorithms Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
    ]
  },
  {
    semester: 5,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22AIC12', name: 'Computer Networks', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC13', name: 'Deep Learning', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC14', name: 'Internet of Things and its Applications', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E1', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E2', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E3', name: 'Elective (OEC/PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIP09', name: 'Deep Learning Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP10', name: 'IoT and its Applications Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
    ]
  },
  {
    semester: 6,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22AIC15', name: 'Full Stack Development', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC16', name: 'Big Data Analytics', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E4', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E5', name: 'Elective (OEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E6', name: 'Elective (PEC/OEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: 'E7', name: 'Elective (PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIP11', name: 'Big Data Analytics Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
    ]
  },
  {
    semester: 7,
    academicYear: '2025-2026',
    sections: 1,
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
    semester: 8,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22AID01', name: 'Project Work', type: 'lab', credits: 10, hoursPerWeek: 20 },
    ]
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable')
  .then(async () => {
    console.log('Connected to DB');
    // First clear any stale entries for semesters we are seeding
    await Curriculum.deleteMany({ semester: { $in: data.map(d => d.semester) } });
    for (const semData of data) {
      await Curriculum.create(semData);
      console.log(`Saved Semester ${semData.semester} (${semData.subjects.length} subjects)`);
    }
    const all = await Curriculum.find({}, { semester: 1, _id: 0 }).sort({ semester: 1 });
    console.log('All semesters in DB:', all.map(c => c.semester).join(', '));
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
