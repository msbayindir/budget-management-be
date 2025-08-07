import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/thrower';
import prisma from '../config/database';

interface OwnershipCheckOptions {
  resourceType: 'expense' | 'user';
  idParam?: string; 
  allowSelf?: boolean; 
}

export const checkResourceOwnership = (options: OwnershipCheckOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        error(res, 'Authentication required', 401);
        return;
      }

      const resourceId = req.params[options.idParam || 'id'];
      if (!resourceId) {
        error(res, 'Resource ID is required', 400);
        return;
      }

      let resourceOwnerId: string | null = null;

      switch (options.resourceType) {
        case 'expense':
          const expense = await prisma.expense.findUnique({
            where: { id: resourceId },
            select: { userId: true, isDeleted: true }
          });

          if (!expense) {
            error(res, 'Expense not found', 404);
            return;
          }

          if (expense.isDeleted) {
            error(res, 'Expense not found', 404);
            return;
          }

          resourceOwnerId = expense.userId;
          break;

        case 'user':
          if (options.allowSelf && resourceId === userId) {
            next();
            return;
          }
          
          const user = await prisma.user.findUnique({
            where: { id: resourceId },
            select: { id: true }
          });

          if (!user) {
            error(res, 'User not found', 404);
            return;
          }

          resourceOwnerId = user.id;
          break;

        default:
          error(res, 'Invalid resource type', 500);
          return;
      }

      if (resourceOwnerId !== userId) {
        error(res, 'Access denied. You can only access your own resources.', 403);
        return;
      }

      next();
    } catch (err) {
      console.error('Ownership check error:', err);
      error(res, 'Internal server error during ownership check', 500);
      return;
    }
  };
};

export const enforceUserOwnership = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId;
    if (!userId) {
      error(res, 'Authentication required', 401);
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      if (req.body.userId && req.body.userId !== userId) {
        error(res, 'You can only create/modify resources for yourself', 403);
        return;
      }
      
      req.body.userId = userId;
    }

    next();
  };
};

export const checkExpenseOwnership = checkResourceOwnership({ 
  resourceType: 'expense' 
});

export const checkUserOwnership = checkResourceOwnership({ 
  resourceType: 'user',
  allowSelf: true 
});
