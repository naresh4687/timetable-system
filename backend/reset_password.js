import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const hashedPassword = await bcrypt.hash('Pass123!', 12);
    await db.collection('users').updateOne(
        { email: 'shanmugapriya@school.edu' },
        { $set: { password: hashedPassword, failedLoginAttempts: 0 } }
    );
    console.log("Password reset successfully. The new password is \"Pass123!\"");
    process.exit(0);
});
