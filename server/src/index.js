import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import summariesRouter from './routes/summaries.js';

const app = express();

// ✅ Allowed frontend origin
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://nlp-summarizer-m2dz.vercel.app';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// ✅ Security middlewares
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// ✅ Routes
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/reports', reportsRouter);
app.use('/summaries', summariesRouter);

// ✅ Error handling
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

// ✅ Connect MongoDB (only once)
if (!mongoose.connection.readyState) {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    mongoose
      .connect(MONGODB_URI)
      .then(() => console.log('✅ MongoDB connected'))
      .catch((err) => console.error('❌ MongoDB error:', err.message));
  } else {
    console.warn('⚠️ MONGODB_URI missing');
  }
}

// ✅ Export app (Vercel serverless function)
export default app;
