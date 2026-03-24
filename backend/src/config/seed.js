import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

import User from '../models/User.js';

const NUM_STAFF = 30; // configurable number of staff
const NUM_STUDENTS = 120; // configurable number of students

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});

    const usersData = [
      // Admin
      {
        name: 'Super Admin',
        email: 'admin@school.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
      },
      // Manager
      {
        name: 'HOD - AD&DS',
        email: 'manager@school.edu',
        password: 'manager123',
        role: 'manager',
        department: 'AD&DS',
      },
      // ── Staff for AD&DS Department ──
      {
        name: 'Dr. Alice Smith',
        email: 'alice@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Data Structures', 'Algorithms', 'Advanced Data Structures'],
      },
      {
        name: 'Prof. Bob Johnson',
        email: 'bob@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Database Systems', 'DBMS Lab', 'Advanced DBMS'],
      },
      {
        name: 'Dr. Carol White',
        email: 'carol@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Mathematics I', 'Mathematics II', 'Discrete Mathematics', 'Probability & Statistics'],
      },
      {
        name: 'Prof. David Kumar',
        email: 'david@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Programming in C', 'Programming Lab', 'Object Oriented Programming', 'OOP Lab', 'Python Programming', 'Python Lab'],
      },
      {
        name: 'Dr. Emily Chen',
        email: 'emily@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Operating Systems', 'OS Lab', 'Computer Networks', 'CN Lab'],
      },
      {
        name: 'Prof. Frank Thomas',
        email: 'frank@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Machine Learning', 'ML Lab', 'Artificial Intelligence', 'Deep Learning', 'DL Lab'],
      },
      {
        name: 'Dr. Grace Lee',
        email: 'grace@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Data Analytics', 'Data Analytics Lab', 'Big Data', 'Big Data Lab', 'Data Visualization'],
      },
      {
        name: 'Prof. Henry Raj',
        email: 'henry@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Web Technologies', 'Web Lab', 'Software Engineering', 'Cloud Computing'],
      },
      {
        name: 'Dr. Irene Patel',
        email: 'irene@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Digital Electronics', 'Computer Architecture', 'Microprocessor', 'Electronics Lab'],
      },
      {
        name: 'Prof. James Wilson',
        email: 'james@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['English', 'Communication Skills', 'Professional Ethics'],
      },
      {
        name: 'Dr. Karen Singh',
        email: 'karen@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['Physics', 'Physics Lab', 'Environmental Science'],
      },
      {
        name: 'Prof. Liam Brown',
        email: 'liam@school.edu',
        password: 'staff123',
        role: 'staff',
        department: 'AD&DS',
        subjects: ['NLP', 'NLP Lab', 'Information Retrieval', 'Computer Vision'],
      },
    ];

    // Generate dynamic staff members
    for (let i = 1; i <= NUM_STAFF; i++) {
        usersData.push({
            name: `Staff Member ${i}`,
            email: `staff${i}@school.edu`,
            password: 'staff123',
            role: 'staff',
            department: 'AD&DS',
            // Assign some random subjects or keep it empty for them to select
            subjects: i % 2 === 0 ? ['Programming in C'] : ['Data Structures']
        });
    }

    // Generate dynamic students
    const sections = ['A', 'B', 'C'];
    for (let i = 1; i <= NUM_STUDENTS; i++) {
        usersData.push({
            name: `Student ${i}`,
            email: `student${i}@school.edu`,
            password: 'student123',
            role: 'student',
            department: 'AD&DS',
            section: sections[i % sections.length], 
            batch: '2024-2028'
        });
    }


    for (const data of usersData) {
      const user = new User(data);
      await user.save();
    }

    console.log('✅ Sample users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@school.edu    / admin123');
    console.log('  Manager: manager@school.edu  / manager123');
    console.log('  Staff:   staff1@school.edu to staff' + NUM_STAFF + '@school.edu / staff123');
    console.log('  Student: student1@school.edu to student' + NUM_STUDENTS + '@school.edu / student123');
    console.log('  (All staff use password: staff123, all students use password: student123)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
