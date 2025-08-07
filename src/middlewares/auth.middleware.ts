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

export const authenticateToken = async (req:Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return error(res, 'Access token is required', 401);
  }
  
  try {
    // Normal JWT doğrulama
    const decoded = verifyAccessToken(token);
    
    // Bu kullanıcının aktif refresh token'ı var mı kontrol et
    const activeRefreshToken = await prisma.refreshToken.findFirst({
      where: { 
        userId: decoded.userId,
        expiresAt: { gt: new Date() } // Süresi geçmemiş
      }
    });
    
    if (!activeRefreshToken) {
      return error(res, 'Session expired. Please login again.', 401);
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired access token', 401);
  }
};