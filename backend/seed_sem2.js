import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const sem2 = {
  semester: 2,
  academicYear: '2025-2026',
  sections: 1,
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
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable')
  .then(async () => {
    console.log('Connected to DB');
    await Curriculum.deleteMany({ semester: 2 });
    await Curriculum.create(sem2);
    console.log(`✅ Saved Semester 2 (${sem2.subjects.length} subjects)`);
    const all = await Curriculum.find({}, { semester: 1, _id: 0 }).sort({ semester: 1 });
    console.log('📚 DB semesters:', all.map(c => c.semester).join(', '));
    process.exit(0);
  })
  .catch(err => { console.error(err.message); process.exit(1); });
