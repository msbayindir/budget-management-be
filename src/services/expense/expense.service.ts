import prisma from '../../config/database';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto } from '../../validations/expense.validation';


export const createExpense = async (userId: string, data: CreateExpenseDto) => {
  const expense = await prisma.expense.create({
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date || new Date(),
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return expense;
};


export const getExpenses = async (userId: string, query: ExpenseQueryDto) => {
  const { category, startDate, endDate, page, limit } = query;
  const skip = (page - 1) * limit;


  const where: any = { userId, isDeleted: false };

  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }


  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const getExpenseById = async (userId: string, expenseId: string) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!expense) {
    throw new Error('Expense not found');
  }

  return expense;
};


export const updateExpense = async (userId: string, expenseId: string, data: UpdateExpenseDto) => {

  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
      isDeleted: false,
    },
  });

  if (!existingExpense) {
    throw new Error('Expense not found');
  }

  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return updatedExpense;
};


export const deleteExpense = async (userId: string, expenseId: string) => {

  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
  });

  if (!existingExpense) {
    throw new Error('Expense not found');
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { isDeleted: true },
  });

  return { message: 'Expense deleted successfully' };
};


export const getMonthlyTotal = async (userId: string, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await prisma.expense.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    year,
    month,
    total: result._sum.amount || 0,
  };
};


export const getCategoryAnalysis = async (userId: string, year?: number, month?: number) => {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (year && month) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else if (year) {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }

  const where: any = { userId };
  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  const categoryTotals = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  const totalAmount = categoryTotals.reduce(
    (sum, category) => sum + (category._sum.amount || 0),
    0
  );

  const analysis = categoryTotals.map((category) => ({
    category: category.category,
    total: category._sum.amount || 0,
    count: category._count._all,
    percentage: totalAmount > 0 ? ((category._sum.amount || 0) / totalAmount) * 100 : 0,
  }));

  return {
    categories: analysis,
    totalAmount,
    period: year && month ? `${year}-${month.toString().padStart(2, '0')}` : year ? year.toString() : 'all-time',
  };
};


export const getTopCategory = async (userId: string, year?: number, month?: number) => {
  const analysis = await getCategoryAnalysis(userId, year, month);
  
  if (analysis.categories.length === 0) {
    return null;
  }

  return {
    category: analysis.categories[0].category,
    total: analysis.categories[0].total,
    count: analysis.categories[0].count,
    percentage: analysis.categories[0].percentage,
  };
};
