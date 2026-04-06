import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ 'name': { $regex: /shanmuga/i } }).toArray();
    fs.writeFileSync('out.json', JSON.stringify(users, null, 2), 'utf-8');
    process.exit(0);
});
