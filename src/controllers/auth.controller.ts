import { Request, Response } from 'express';
import { registerUser, loginUser, refreshUserToken, logoutUser } from '../services/auth/auth.service';
import { success, error } from '../utils/thrower';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../validations/auth.validation';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
export const register = async (req: Request, res: Response) => {
  try {
    const data: RegisterDto = req.body;
    const result = await registerUser(data);
    return success(res, 'User registered successfully', result, 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
  try {
    const data: LoginDto = req.body;
    const result = await loginUser(data);
    return success(res, 'Login successful', result);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const data: RefreshTokenDto = req.body;
    const result = await refreshUserToken(data);
    return success(res, 'Token refreshed successfully', result);
  } catch (err: any) {
    return error(res, err.message, 401);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);
    return success(res, 'Logout successful');
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};
