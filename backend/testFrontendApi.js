import axios from 'axios';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');
        
        // Let's create a temp token for whatever user is in the DB
        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            process.exit(0);
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

        const url = 'http://localhost:5000/api/subjects?year=2023-2024&type=even&semester=2';
        console.log("Fetching URL:", url);

        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Response data:", JSON.stringify(res.data, null, 2));

        process.exit(0);
    } catch (e) {
        if (e.response) {
            console.error("API Error:", e.response.status, e.response.data);
        } else {
            console.error("Error:", e.message);
        }
        process.exit(1);
    }
};
run();
