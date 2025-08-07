import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  try {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: '15m'
    });
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  try {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '7d'
    });
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
