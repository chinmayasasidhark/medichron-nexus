import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback for development without token if BYPASS_AUTH is set to "true"
    if (process.env.BYPASS_AUTH === 'true') {
      req.user = { uid: 'dev-user-123', email: 'dev@medichron.ai' };
      return next();
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Only verify if Firebase is initialized and has credentials
    const isFirebaseInitialized = admin.apps.length > 0;
    
    if (isFirebaseInitialized) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } else {
      // If admin is not initialized, mock verification for development
      if (process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV !== 'production') {
        req.user = { uid: 'dev-user-123', email: 'dev@medichron.ai' };
        return next();
      }
      return res.status(500).json({ error: 'Firebase Admin not initialized' });
    }
  } catch (error: any) {
    console.error('Error verifying Firebase token:', error);
    
    // If it's a dev environment and token fails, we can fallback if configured
    if (process.env.BYPASS_AUTH === 'true') {
      console.warn('Authentication failed, but BYPASS_AUTH is true. Using dev user fallback.');
      req.user = { uid: 'dev-user-123', email: 'dev@medichron.ai' };
      return next();
    }
    
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
};
