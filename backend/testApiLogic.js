import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Curriculum from './src/models/Curriculum.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable');

        const year = '2023-2024';
        const selectedSemester = 2;

        const query = { 
            academicYear: year,
            semester: selectedSemester 
        };

        const curriculum = await Curriculum.findOne(query);

        if (!curriculum) {
            console.log("No curriculum found for query");
        } else {
            console.log(`Found curriculum! Sections: ${curriculum.sections}, Total subjects: ${curriculum.subjects.length}`);
            
            const theorySubjects = [];
            curriculum.subjects
                .filter((s) => s.type === 'theory')
                .forEach((s) => {
                    for (let i = 0; i < curriculum.sections; i++) {
                        theorySubjects.push(s.name);
                    }
                });

            console.log(`Theory subjects after filter/loop: ${theorySubjects.length}`, theorySubjects);
        }
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
};

run();
