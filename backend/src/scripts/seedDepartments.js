import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import connectDB from '../config/db.js';

dotenv.config();

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Electronics',
  'Mechanical',
  'Civil',
  'Administration',
];

const seedDepartments = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding departments...');

    for (const name of DEPARTMENTS) {
      const existing = await Department.findOne({ name });
      if (!existing) {
        await Department.create({ name });
        console.log(`✅ Added: ${name}`);
      } else {
        console.log(`❕ Exists: ${name}`);
      }
    }

    console.log('🏁 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDepartments();
