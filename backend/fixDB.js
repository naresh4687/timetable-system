import mongoose from 'mongoose';
import Curriculum from './src/models/Curriculum.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');
  
  const mappings = {
    1: '2023-2024',
    2: '2023-2024',
    3: '2024-2025',
    4: '2024-2025',
    5: '2025-2026',
    6: '2025-2026',
    7: '2026-2027',
    8: '2026-2027'
  };

  for (let sem = 1; sem <= 8; sem++) {
    await Curriculum.updateOne(
      { semester: sem },
      { $set: { academicYear: mappings[sem] } }
    );
  }

  const docs = await Curriculum.find({}, 'semester academicYear subjects.name type').lean();
  let missing = [];
  for (let sem = 1; sem <= 8; sem++) {
    let doc = docs.find(d => d.semester === sem);
    if (!doc || !doc.subjects || doc.subjects.length === 0) {
      missing.push(sem);
    }
  }
  
  if (missing.length > 0) {
    console.log('WARNING: The following semesters are missing completely or have 0 subjects:', missing);
  } else {
    console.log('SUCCESS: All 8 semesters have subjects and are mapped correctly.');
  }

  process.exit();
};
run();
