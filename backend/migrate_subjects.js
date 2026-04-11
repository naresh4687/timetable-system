import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timetable', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to DB'))
.catch(err => console.error(err));

async function runMigration() {
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking for migration...`);

        let updatedCount = 0;
        for (let user of users) {
             let needsUpdate = false;
             const newSubjects = [];
             
             if (user.subjects && user.subjects.length > 0) {
                 for (let sub of user.subjects) {
                     // Check if it's currently a string or already an object
                     if (typeof sub === 'string') {
                         newSubjects.push({ subjectId: sub, preference: 3 });
                         needsUpdate = true;
                     } else if (sub && sub.subjectId) {
                         newSubjects.push(sub); // Already an object, retain it
                     } else {
                         // Some other unknown type? 
                         try {
                              let s = (sub.toString());
                              if (s !== '[object Object]') {
                                   newSubjects.push({ subjectId: s, preference: 3 });
                                   needsUpdate = true;
                              }
                         } catch (e) {}
                     }
                 }
                 
                 if (needsUpdate) {
                     // We cannot just use save() easily if schema validation fails during migration (before we update the schema model)
                     // Actually, we are using the Mongoose model right now... If User.js hasn't been updated yet, Mongoose might strip the object.
                     // So we should do a raw update!
                     await User.collection.updateOne(
                         { _id: user._id },
                         { $set: { subjects: newSubjects } }
                     );
                     updatedCount++;
                 }
             }
        }
        console.log(`Migration complete! Successfully updated ${updatedCount} users.`);
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
}

runMigration();
