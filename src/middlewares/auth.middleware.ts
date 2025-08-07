import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { error } from '../utils/thrower';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    error(res, 'Access token is required', 401);
    return;
  }
  
  try {

    const decoded = verifyAccessToken(token);
    

    const activeRefreshToken = await prisma.refreshToken.findFirst({
      where: { 
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      }
    });
    
    if (!activeRefreshToken) {
      error(res, 'Session expired. Please login again.', 401);
      return;
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    error(res, 'Invalid or expired access token', 401);
    return;
  }
};