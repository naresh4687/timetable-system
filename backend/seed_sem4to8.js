import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';
import MasterSubject from './src/models/MasterSubject.js';

dotenv.config();

const data = [
  {
    semester: 4,
    academicYear: '2025-2026',
    sections: 1,
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
      { code: '22MAN08R', name: 'Soft/Analytical Skills - IV', type: 'theory', credits: 0, hoursPerWeek: 3 },
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
      { code: 'E6', name: 'Elective (OEC/PEC)', type: 'theory', credits: 3, hoursPerWeek: 3 },
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
      { code: '22GED02', name: 'Internship / Industrial Training', type: 'lab', credits: 2, hoursPerWeek: 0 },
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
    for (const semData of data) {
      await Curriculum.deleteMany({ semester: semData.semester });
      await Curriculum.create(semData);
      
      for (const sub of semData.subjects) {
        await MasterSubject.findOneAndUpdate(
          { code: sub.code },
          { $set: sub },
          { upsert: true }
        );
      }
      
      console.log(`✅ Saved Semester ${semData.semester} (${semData.subjects.length} subjects)`);
    }
    const all = await Curriculum.find({}, { semester: 1, _id: 0 }).sort({ semester: 1 });
    console.log('\nAll semesters in DB:', all.map(c => c.semester).join(', '));
    process.exit(0);
  })
  .catch(err => { console.error(err.message); process.exit(1); });
