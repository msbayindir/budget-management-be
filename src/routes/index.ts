import { Router } from 'express';
import authRoutes from './auth.routes';
import expenseRoutes from './expense.routes';

const router: Router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Budget Management API',
  });
});

export default router;
