import mongoose from 'mongoose';
import Curriculum from './src/models/Curriculum.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');
  const docs = await Curriculum.find({}, 'semester academicYear subjects').lean();
  const output = docs.map(doc => ({
    semester: doc.semester,
    academicYear: doc.academicYear,
    charCodes: doc.academicYear ? Array.from(doc.academicYear).map(c => c.charCodeAt(0)) : null,
    subjectCount: doc.subjects ? doc.subjects.length : 0
  }));
  fs.writeFileSync('db_output.json', JSON.stringify(output, null, 2));
  console.log("Written to db_output.json");
  process.exit();
};
run();
