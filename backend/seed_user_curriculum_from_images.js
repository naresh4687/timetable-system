import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const data = [
  {
    semester: 3,
    academicYear: '2025-2026',
    sections: 1,
    subjects: [
      { code: '22MYB05', name: 'Discrete Mathematics', type: 'theory', credits: 4, hoursPerWeek: 4 },
      { code: '22AIC04', name: 'Java programming', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC05', name: 'Artificial intelligence', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC06', name: 'Algorithms', type: 'theory', credits: 3, hoursPerWeek: 3 },
      { code: '22AIC07', name: 'Data Exploration and Visualization', type: 'theory', credits: 4, hoursPerWeek: 5 },
      { code: '22AIP03', name: 'Java programming Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
      { code: '22AIP04', name: 'Artificial intelligence Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
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
      { code: '22AIP10', name: 'Internet of Things and its Applications Laboratory', type: 'lab', credits: 2, hoursPerWeek: 4 },
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
      { code: '22GED02', name: 'Internship/Industrial Training', type: 'lab', credits: 2, hoursPerWeek: 2 },
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
      // Upsert
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
