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

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database');
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

