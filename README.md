# Budget Management Backend

A comprehensive budget tracking and expense management API built with Node.js, TypeScript, MongoDB, and Prisma.

## 🚀 Features

### Authentication & Authorization
- **JWT-based Authentication**: Access and refresh token system
- **Secure Password Hashing**: bcrypt with salt rounds
- **User Registration & Login**: Email and password authentication
- **Token Refresh**: Automatic token renewal system
- **Protected Routes**: Middleware-based route protection

### Expense Management
- **CRUD Operations**: Create, read, update, delete expenses
- **User-specific Data**: Users can only access their own expenses
- **Advanced Filtering**: Filter by date range and category
- **Pagination**: Efficient data retrieval with pagination
- **Category Management**: Organize expenses by categories

### Analytics & Reporting
- **Monthly Totals**: Calculate total expenses per month
- **Category Analysis**: Breakdown expenses by category with percentages
- **Top Category**: Identify highest spending categories
- **Flexible Time Periods**: Filter analytics by year/month or all-time

### API Documentation
- **Swagger Integration**: Interactive API documentation at `/api-docs`
- **Comprehensive Schemas**: Detailed request/response documentation
- **Authentication Examples**: Bearer token usage examples

## 🛠 Tech Stack

- **Backend**: Node.js + TypeScript
- **Database**: MongoDB
- **ORM**: Prisma (MongoDB connector)
- **Package Manager**: pnpm
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **API Documentation**: Swagger (swagger-jsdoc + swagger-ui-express)
- **HTTP Framework**: Express.js

## 📁 Project Structure

```
src/
├── config/
│   ├── database.ts          # Prisma client configuration
│   ├── env.ts              # Environment variables
│   └── swagger.ts          # Swagger documentation setup
├── controllers/
│   ├── auth.controller.ts   # Authentication endpoints
│   └── expense.controller.ts # Expense management endpoints
├── middlewares/
│   ├── auth.middleware.ts   # JWT authentication middleware
│   ├── error.middleware.ts  # Global error handling
│   └── validation.middleware.ts # Request validation
├── routes/
│   ├── auth.routes.ts      # Authentication routes
│   ├── expense.routes.ts   # Expense routes
│   └── index.ts           # Route aggregation
├── services/
│   ├── auth/
│   │   └── auth.service.ts # Authentication business logic
│   └── expense/
│       └── expense.service.ts # Expense business logic
├── utils/
│   ├── jwt.ts             # JWT utilities
│   ├── password.ts        # Password hashing utilities
│   └── thrower.ts         # Standardized API responses
├── validations/
│   ├── auth.validation.ts  # Authentication validation schemas
│   └── expense.validation.ts # Expense validation schemas
├── app.ts                 # Express app configuration
└── index.ts              # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-management-be
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="mongodb://localhost:27017/budget_management"
   JWT_ACCESS_SECRET="your-super-secret-access-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   PORT=3000
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Push schema to database
   pnpm prisma:push
   ```

5. **Start the server**
   ```bash
   # Development mode
   pnpm dev
   
   # Production mode
   pnpm build
   pnpm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 🔐 Authentication

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Using Protected Endpoints
```bash
Authorization: Bearer <access_token>
```

## 💰 Expense Management

### Create Expense
```bash
POST /api/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 25.50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:00:00Z"
}
```

### Get Expenses with Filtering
```bash
GET /api/expenses?category=Food&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z&page=1&limit=10
Authorization: Bearer <access_token>
```

## 📊 Analytics

### Monthly Total
```bash
GET /api/expenses/analytics/monthly?year=2024&month=1
Authorization: Bearer <access_token>
```

### Category Analysis
```bash
GET /api/expenses/analytics/categories?year=2024&month=1
Authorization: Bearer <access_token>
```

### Top Spending Category
```bash
GET /api/expenses/analytics/top-category?year=2024
Authorization: Bearer <access_token>
```

## 🛡 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Separate access and refresh tokens
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable CORS settings
- **Error Handling**: Secure error messages without sensitive data exposure

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:push     # Push schema to database
pnpm prisma:studio   # Open Prisma Studio
```

### Database Management

```bash
# View database in Prisma Studio
pnpm prisma:studio

# Reset database (development only)
pnpm prisma db push --force-reset
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Happy coding! 🎉**
