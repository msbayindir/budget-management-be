import { Request, Response } from 'express';
import { 
  createExpense as createExpenseService, 
  getExpenses as getExpensesService, 
  getExpenseById as getExpenseByIdService, 
  updateExpense as updateExpenseService, 
  deleteExpense as deleteExpenseService, 
  getMonthlyTotal, 
  getCategoryAnalysis, 
  getTopCategory,
  getExpensesForCSV,
  getMonthlyPDFReport 
} from '../services/expense/expense.service';
import { success, error } from '../utils/thrower';
import { sendPrismaError } from '../utils/prismaErrorHandler';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto } from '../validations/expense.validation';

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createExpenseController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data: CreateExpenseDto = req.body;
    const expense = await createExpenseService(userId, data);
    return success(res, 'Expense created successfully', expense, 201);
  } catch (err: any) {
    return sendPrismaError(res, err);
  }
};

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get user expenses with filtering and pagination
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getExpensesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const query: ExpenseQueryDto = req.query as any;
    const result = await getExpensesService(userId, query);
    return success(res, 'Expenses retrieved successfully', result);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 */
export const getExpenseByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const expense = await getExpenseByIdService(userId, id);
    return success(res, 'Expense retrieved successfully', expense);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const updateExpenseController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data: UpdateExpenseDto = req.body;
    const expense = await updateExpenseService(userId, id, data);
    return success(res, 'Expense updated successfully', expense);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 */
export const deleteExpenseController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await deleteExpenseService(userId, id);
    return success(res, 'Expense deleted successfully');
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/analytics/monthly:
 *   get:
 *     summary: Get monthly expense analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for analytics (default current year)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for analytics (default current month)
 *     responses:
 *       200:
 *         description: Monthly analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getMonthlyAnalyticsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;
    const currentDate = new Date();
    const yearParam = year ? parseInt(year as string) : currentDate.getFullYear();
    const monthParam = month ? parseInt(month as string) : currentDate.getMonth() + 1;
    const result = await getMonthlyTotal(userId, yearParam, monthParam);
    return success(res, 'Monthly analytics retrieved successfully', result);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/analytics/category:
 *   get:
 *     summary: Get category-based expense analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Category analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getCategoryAnalyticsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;
    const yearParam = year ? parseInt(year as string) : undefined;
    const monthParam = month ? parseInt(month as string) : undefined;
    const result = await getCategoryAnalysis(userId, yearParam, monthParam);
    return success(res, 'Category analytics retrieved successfully', result);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/analytics/top-category:
 *   get:
 *     summary: Get top spending category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Top category retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getTopCategoryController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;
    const yearParam = year ? parseInt(year as string) : undefined;
    const monthParam = month ? parseInt(month as string) : undefined;
    const result = await getTopCategory(userId, yearParam, monthParam);
    return success(res, 'Top category retrieved successfully', result);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/export/csv:
 *   get:
 *     summary: Export expenses as CSV
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
export const exportExpensesCSVController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const query: ExpenseQueryDto = req.query as any;
    
    const expenses = await getExpensesForCSV(userId, query);
    
    // Create CSV headers
    const headers = ['ID', 'Amount', 'Category', 'Description', 'Date', 'Created At'];
    
    // Create CSV rows
    const csvRows = expenses.map(expense => [
      expense.id,
      expense.amount.toString(),
      expense.category,
      expense.description || '',
      expense.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      expense.createdAt.toISOString().split('T')[0] // Format as YYYY-MM-DD
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Set response headers for CSV download
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.send(csvContent);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/expenses/reports/monthly-pdf:
 *   get:
 *     summary: Get monthly PDF report data (JSON format)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year for the report
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for the report (1-12)
 *     responses:
 *       200:
 *         description: Monthly PDF report data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportInfo:
 *                   type: object
 *                   properties:
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     period:
 *                       type: object
 *                     user:
 *                       type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                     totalTransactions:
 *                       type: integer
 *                     averageTransaction:
 *                       type: number
 *                 categoryBreakdown:
 *                   type: array
 *                 weeklyBreakdown:
 *                   type: array
 *                 topExpenses:
 *                   type: array
 *                 insights:
 *                   type: object
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
export const getMonthlyPDFReportController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;
    
    // Validate required parameters
    if (!year || !month) {
      return error(res, 'Year and month parameters are required', 400);
    }
    
    const yearParam = parseInt(year as string);
    const monthParam = parseInt(month as string);
    
    // Validate year and month ranges
    if (isNaN(yearParam) || yearParam < 1900 || yearParam > 2100) {
      return error(res, 'Invalid year parameter', 400);
    }
    
    if (isNaN(monthParam) || monthParam < 1 || monthParam > 12) {
      return error(res, 'Invalid month parameter (must be 1-12)', 400);
    }
    
    const reportData = await getMonthlyPDFReport(userId, yearParam, monthParam);
    
    return success(res, 'Monthly PDF report data retrieved successfully', reportData);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};
