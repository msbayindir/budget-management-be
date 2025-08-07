import { Router } from 'express';
import { 
  createExpenseController,
  getExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
  getMonthlyAnalyticsController,
  getCategoryAnalyticsController,
  getTopCategoryController
} from '../controllers/expense.controller';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from '../validations/expense.validation';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics endpoints (must be before /:id routes)
router.get('/analytics/monthly', getMonthlyAnalyticsController);
router.get('/analytics/categories', getCategoryAnalyticsController);
router.get('/analytics/top-category', getTopCategoryController);

// CRUD operations
router.post('/', validateBody(createExpenseSchema), createExpenseController);
router.get('/', validateQuery(expenseQuerySchema), getExpensesController);
router.get('/:id', getExpenseByIdController);
router.put('/:id', validateBody(updateExpenseSchema), updateExpenseController);
router.delete('/:id', deleteExpenseController);

export default router;
