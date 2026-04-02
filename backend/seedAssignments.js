import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from './src/models/Assignment.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const seedAssignments = async () => {
  try {
    const sampleAssignments = [
      {
        academicYear: '2025-2026',
        semester: 4,
        department: 'Computer Science and Engineering',
        status: 'pending',
        assignments: [
          { subjectName: 'Data Structures Pipeline', facultyName: 'Dr. Alan Turing' },
          { subjectName: 'Algorithms Design', facultyName: 'Dr. Ada Lovelace' },
        ],
      },
      {
        academicYear: '2025-2026',
        semester: 6,
        department: 'Information Technology',
        status: 'adminApproved',
        adminRemarks: 'Approved pending manager signature.',
        assignments: [
          { subjectName: 'Machine Learning Basics', facultyName: 'Dr. Geoffrey Hinton' },
          { subjectName: 'Blockchain Implementation', facultyName: 'Dr. Satoshi Nakamoto' },
        ],
      },
    ];

    await Assignment.insertMany(sampleAssignments);
    console.log('Sample Assignment Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during import: ${error.message}`);
    process.exit(1);
  }
};

seedAssignments();
