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
      isDeleted: false,
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

  const where: any = { userId, isDeleted: false };
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

export const getExpensesForCSV = async (userId: string, query: ExpenseQueryDto) => {
  const { category, startDate, endDate } = query;

  const where: any = { userId, isDeleted: false };

  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      amount: true,
      category: true,
      description: true,
      date: true,
      createdAt: true,
    },
  });

  return expenses;
};

export const getMonthlyPDFReport = async (userId: string, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const previousMonthStart = new Date(year, month - 2, 1);
  const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

  const where = {
    userId,
    isDeleted: false,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  const previousWhere = {
    userId,
    isDeleted: false,
    date: {
      gte: previousMonthStart,
      lte: previousMonthEnd,
    },
  };

  // Get user information
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Get current month expenses with details
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      amount: true,
      category: true,
      description: true,
      date: true,
      createdAt: true,
    },
  });

  // Get current month totals
  const currentMonthTotal = await prisma.expense.aggregate({
    where,
    _sum: { amount: true },
    _count: { _all: true },
    _avg: { amount: true },
    _max: { amount: true },
    _min: { amount: true },
  });

  // Get previous month totals for comparison
  const previousMonthTotal = await prisma.expense.aggregate({
    where: previousWhere,
    _sum: { amount: true },
    _count: { _all: true },
  });

  // Get category breakdown
  const categoryBreakdown = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true },
    _count: { _all: true },
    _avg: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' },
    },
  });

  // Get daily spending pattern
  const dailySpending = await prisma.expense.groupBy({
    by: ['date'],
    where,
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: {
      date: 'asc',
    },
  });

  // Calculate statistics
  const totalAmount = currentMonthTotal._sum.amount || 0;
  const previousTotalAmount = previousMonthTotal._sum.amount || 0;
  const monthOverMonthChange = previousTotalAmount > 0 
    ? ((totalAmount - previousTotalAmount) / previousTotalAmount) * 100 
    : 0;

  const categoryAnalysis = categoryBreakdown.map((category) => ({
    category: category.category,
    total: category._sum.amount || 0,
    count: category._count._all,
    average: category._avg.amount || 0,
    percentage: totalAmount > 0 ? ((category._sum.amount || 0) / totalAmount) * 100 : 0,
  }));

  // Process daily spending for chart data
  const dailyData = dailySpending.map((day) => ({
    date: day.date.toISOString().split('T')[0],
    total: day._sum.amount || 0,
    count: day._count._all,
  }));

  // Get top expenses
  const topExpenses = expenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
    .map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString().split('T')[0],
    }));

  // Calculate week-by-week breakdown
  const weeklyBreakdown = [];
  const currentDate = new Date(startDate);
  let weekNumber = 1;

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime());
    }

    const weekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });

    const weekTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    weeklyBreakdown.push({
      week: weekNumber,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      total: weekTotal,
      count: weekExpenses.length,
      expenses: weekExpenses.length,
    });

    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    reportInfo: {
      generatedAt: new Date().toISOString(),
      period: {
        year,
        month,
        monthName: monthNames[month - 1],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      user: {
        name: user?.name || 'User',
        email: user?.email || '',
      },
    },
    summary: {
      totalAmount,
      totalTransactions: currentMonthTotal._count._all || 0,
      averageTransaction: currentMonthTotal._avg.amount || 0,
      highestTransaction: currentMonthTotal._max.amount || 0,
      lowestTransaction: currentMonthTotal._min.amount || 0,
      previousMonthTotal: previousTotalAmount,
      monthOverMonthChange,
      monthOverMonthPercentage: monthOverMonthChange,
    },
    categoryBreakdown: categoryAnalysis,
    weeklyBreakdown,
    dailySpending: dailyData,
    topExpenses,
    allExpenses: expenses.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString().split('T')[0],
      createdAt: expense.createdAt.toISOString().split('T')[0],
    })),
    insights: {
      mostExpensiveCategory: categoryAnalysis[0]?.category || 'N/A',
      mostFrequentCategory: categoryAnalysis.sort((a, b) => b.count - a.count)[0]?.category || 'N/A',
      averageDailySpending: totalAmount / new Date(year, month, 0).getDate(),
      spendingTrend: monthOverMonthChange > 0 ? 'increasing' : monthOverMonthChange < 0 ? 'decreasing' : 'stable',
    },
  };
};
