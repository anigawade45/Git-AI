import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import repositoryRoutes from './src/routes/repositoryRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import analysisRoutes from './src/routes/analysisRoutes.js';
import documentationRoutes from './src/routes/documentationRoutes.js';

// Load Environment Variables (Phase 6 RAG Pipeline enabled)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS Fail-Fast Check
const frontendUrl = process.env.FRONTEND_URL;
if (process.env.NODE_ENV === 'production' && !frontendUrl) {
  throw new Error('FRONTEND_URL environment variable must be configured in production.');
}

// Core Middleware
app.use(
  cors({
    origin: frontendUrl || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root Index Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GitHub Knowledge Assistant API Server 🚀',
    status: 'online',
    health: `http://localhost:${PORT}/api/health`,
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      repositories: '/api/repositories',
      ai: '/api/ai',
      analysis: '/api/analysis',
      docs: '/api/docs',
    },
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GitHub Knowledge Assistant API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/docs', documentationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Async Server Startup (Connect DB before listening for requests)
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 Backend Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`
      );
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
