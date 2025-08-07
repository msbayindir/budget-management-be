import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation';
import { authLimiter } from '../utils/rateLimiter';

const router: Router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter.middleware(), validateBody(registerSchema), register);
router.post('/login', authLimiter.middleware(), validateBody(loginSchema), login);
router.post('/refresh', authLimiter.middleware(), validateBody(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);

export default router;
