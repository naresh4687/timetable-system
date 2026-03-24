import mongoose from 'mongoose';
import Curriculum from './src/models/Curriculum.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');
    console.log('MongoDB Connected... Running Normalization');

    const curricula = await Curriculum.find({});
    let updatedCount = 0;

    for (let doc of curricula) {
      let needsSave = false;

      // 1. Fix en-dashes in academicYear
      if (doc.academicYear && doc.academicYear.includes('–')) {
        doc.academicYear = doc.academicYear.replace(/–/g, '-');
        needsSave = true;
      }

      // 2. Ensure type is lowercase 'theory' or 'lab'
      if (doc.subjects && doc.subjects.length > 0) {
        doc.subjects.forEach(sub => {
          if (sub.type && sub.type !== 'theory' && sub.type !== 'lab') {
            sub.type = sub.type.toLowerCase().trim();
            if (sub.type !== 'theory' && sub.type !== 'lab') {
              sub.type = 'theory'; // fallback
            }
            needsSave = true;
          }
        });
      }

      if (needsSave) {
        await doc.save();
        updatedCount++;
        console.log(`Normalized Curriculum for Semester ${doc.semester} (${doc.academicYear})`);
      }
    }

    console.log(`✅ Database Normalization Complete. Fixed ${updatedCount} records.`);

    // 3. Optional: Verify all 1-8 exist
    const existingSems = curricula.map(c => c.semester);
    const missing = [1,2,3,4,5,6,7,8].filter(s => !existingSems.includes(s));
    if (missing.length > 0) {
      console.log(`⚠️ Warning: Missing curricula for semesters: ${missing.join(', ')}`);
      console.log(`Please run 'node seedSubjects.js' to insert sample data for them.`);
    } else {
      console.log(`✅ All 8 semesters are present in the database.`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
