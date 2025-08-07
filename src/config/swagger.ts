import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Management API',
      version: '1.0.0',
      description: 'A comprehensive budget tracking and expense management API built with Node.js, TypeScript, MongoDB, and Prisma',
      contact: {
        name: 'API Support',
        email: 'support@budgetmanagement.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Expense ID',
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Expense amount',
            },
            category: {
              type: 'string',
              description: 'Expense category',
            },
            description: {
              type: 'string',
              description: 'Expense description',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Expense date',
            },
            userId: {
              type: 'string',
              description: 'User ID who created the expense',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update date',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the operation was successful',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              description: 'Response data (if any)',
            },
            error: {
              type: 'string',
              description: 'Error message (if any)',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            error: {
              type: 'string',
              description: 'Detailed validation errors',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Expenses',
        description: 'Expense management endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints',
      },
    ],
  },
  apis: [
    './src/controllers/*.ts',
    './src/routes/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
