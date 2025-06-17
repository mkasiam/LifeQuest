import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebase-admin';
import { storage } from './storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    firebaseUid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!adminAuth) {
      return res.status(500).json({ message: 'Firebase Admin not properly configured' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user exists in our database
    let user = await storage.getUserByFirebaseUid(decodedToken.uid);
    
    // If user doesn't exist, create them
    if (!user) {
      user = await storage.createUser({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};