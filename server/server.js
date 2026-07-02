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

import errorHandler from './middleware/errorHandler.js';

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

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during production deployment
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/contact', contactRoutes);

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

