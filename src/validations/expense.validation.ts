import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  date: z
    .string()
    .datetime('Invalid date format')
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

export const updateExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large')
    .optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category must not exceed 50 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  date: z
    .string()
    .datetime('Invalid date format')
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

export const expenseQuerySchema = z.object({
  category: z.string().optional(),
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be a positive number')
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10'),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryDto = z.infer<typeof expenseQuerySchema>;
