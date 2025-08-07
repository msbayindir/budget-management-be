import { Router } from 'express';
import { 
  createExpenseController,
  getExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
  getMonthlyAnalyticsController,
  getCategoryAnalyticsController,
  getTopCategoryController,
  exportExpensesCSVController
} from '../controllers/expense.controller';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkExpenseOwnership, enforceUserOwnership } from '../middlewares/ownership.middleware';
import { validateObjectId } from '../utils/prismaErrorHandler';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from '../validations/expense.validation';

const router: Router = Router();


router.use(authenticateToken);


router.get('/analytics/monthly', getMonthlyAnalyticsController);
router.get('/analytics/categories', getCategoryAnalyticsController);
router.get('/analytics/top-category', getTopCategoryController);

// Export routes
router.get('/export/csv', validateQuery(expenseQuerySchema), exportExpensesCSVController);


router.post('/', enforceUserOwnership(), validateBody(createExpenseSchema), createExpenseController);
router.get('/', validateQuery(expenseQuerySchema), getExpensesController);
router.get('/:id', validateObjectId('id'), checkExpenseOwnership, getExpenseByIdController);
router.put('/:id', validateObjectId('id'), checkExpenseOwnership, enforceUserOwnership(), validateBody(updateExpenseSchema), updateExpenseController);
router.delete('/:id', validateObjectId('id'), checkExpenseOwnership, deleteExpenseController);

export default router;
