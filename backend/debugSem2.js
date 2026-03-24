import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');

        let cur = await Curriculum.findOne({ semester: 2 }).lean();
        fs.writeFileSync('debug.json', JSON.stringify(cur, null, 2), 'utf-8');
        console.log("Written to debug.json");
        process.exit(0);
    } catch (e) {
        console.error("Failed to seed:", e);
        process.exit(1);
    }
};

run();
