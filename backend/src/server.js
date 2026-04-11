import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import expectationRoutes from './routes/expectationRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import constraintRoutes from './routes/constraintRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Timetable API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/expectations', expectationRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/batch', batchRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

export default app;
