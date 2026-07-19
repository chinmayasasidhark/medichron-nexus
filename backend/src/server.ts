import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import fs from 'fs';
import apiRouter from './routes/api';
import { authenticateToken } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '';

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully using service account key file.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin with service account key:', error);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp();
    console.log('Firebase Admin initialized successfully using GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin using default credentials:', error);
  }
} else {
  console.warn(
    '========================================================================\n' +
    'WARNING: Firebase service account key not provided or not found.\n' +
    'To verify real tokens, please set FIREBASE_SERVICE_ACCOUNT_KEY or\n' +
    'GOOGLE_APPLICATION_CREDENTIALS in your .env file.\n' +
    'Running in development fallback mode (authentication bypass enabled).\n' +
    '========================================================================'
  );
}

app.use(cors());
app.use(express.json());

// Main secure API routes
app.use('/api', authenticateToken, apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    firebaseInitialized: admin.apps.length > 0,
    bypassAuth: process.env.BYPASS_AUTH === 'true'
  });
});

app.listen(PORT, () => {
  console.log(`MediChron Backend running on port ${PORT}`);
});
