import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';
import questionRoutes from './routes/question.routes.js';
import resultRoutes from './routes/result.routes.js';
import reportRoutes from './routes/report.routes.js';
import violationRoutes from './routes/violation.routes.js';
import contactRoutes from './routes/contact.routes.js';
import cohortRoutes from './routes/cohort.routes.js';

import errorHandler from './middleware/errorHandler.js';
import Student from './models/Student.js';
import { calculateAcademicYear } from './utils/academicYearHelper.js';

dotenv.config();

// Global Uncaught Exception & Promise Rejection Handlers (Prevents backend freeze)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...', err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1); // Process managers like Render/Railway/PM2 will automatically reboot the server
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...', err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));

import { generalLimiter } from './middleware/rateLimiter.js';

// Setup explicit allowed origins from environment and local dev
const allowedOriginsList = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:5000'
];

const allAllowedOrigins = new Set([...defaultAllowedOrigins, ...allowedOriginsList]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, uptime bots)
    if (!origin) return callback(null, true);

    // Allow explicitly defined origins
    if (allAllowedOrigins.has(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments & subdomains securely
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // In development mode, allow any local or lan origin
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In strict production, if not matched
    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    callback(new Error('CORS policy violation: Access not allowed for this origin.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Apply general rate limiter to prevent API abuse
app.use('/api', generalLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint for Uptime ping services (prevents Render free tier cold starts)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/courses', cohortRoutes);

app.use(errorHandler);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mcq-test-platform';

// Mongoose Connection Event Monitoring for robustness
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost! Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB database connection error:', err);
});

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Stop waiting for DB after 5 seconds to allow instant restart retry
})
  .then(() => {
    console.log('Connected to MongoDB database');

    // Startup migration commented out to prevent overwriting manual student academic year edits.
    // Batch and Year are now decoupled and editable independently.
    /*
    const updateAllStudentsAcademicYears = async () => {
      try {
        const students = await Student.find({});
        let updatedCount = 0;
        for (const student of students) {
          if (!student.batch) continue;
          const currentCalculatedYear = calculateAcademicYear(student.batch);
          if (student.year !== currentCalculatedYear) {
            student.year = currentCalculatedYear;
            await student.save();
            updatedCount++;
          }
        }
        if (updatedCount > 0) {
          console.log(`[Migration] Successfully updated academic year for ${updatedCount} students.`);
        } else {
          console.log('[Migration] All student academic years are up to date.');
        }
      } catch (error) {
        console.error('[Migration] Error updating students academic years on startup:', error);
      }
    };
    updateAllStudentsAcademicYears();
    */

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful Shutdown on termination signal (SIGTERM/SIGINT) from Render/Railway/PM2
    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false).then(() => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

