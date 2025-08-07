import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation';

const router: Router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);

export default router;
