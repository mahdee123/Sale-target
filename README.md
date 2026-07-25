# Sales Target Tracking System

A personal local sales tracking system for managing daily sales across multiple branches and salesmen.

## Features

- **Admin Dashboard**: View all branches, salesmen, and sales data
- **Branch Management**: Create, edit, and delete branches
- **Salesman Management**: Manage salesmen accounts, reset passwords, enable/disable
- **Sales Entry**: Salesmen can add unlimited daily sales entries
- **Reports**: Daily, Monthly, Branch-wise, and Salesman-wise reports
- **Filters**: Filter by branch, salesman, month, and year

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React.js
- **Database**: SQLite
- **Authentication**: JWT

## Default Admin Login

- **Username**: admin
- **Password**: admin123

## Installation

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will run on http://localhost:3000

## Project Structure

```
Daily_Sales_Target/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── branchController.js
│   │   ├── salesmanController.js
│   │   └── salesController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── branchRoutes.js
│   │   ├── salesmanRoutes.js
│   │   └── salesRoutes.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Admin/
│   │   │   ├── Salesman/
│   │   │   └── Common/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
```

## Usage

1. Start the backend server (http://localhost:5000)
2. Start the React frontend (http://localhost:3000)
3. Login with admin credentials (admin / admin123)
4. Create branches
5. Create salesmen accounts
6. Login as salesman to add sales entries
7. View reports on admin dashboard

## API Endpoints

### Auth
- POST /api/auth/login
- GET /api/auth/me

### Branches (Admin)
- GET /api/branches
- POST /api/branches
- PUT /api/branches/:id
- DELETE /api/branches/:id

### Salesmen (Admin)
- GET /api/salesmen
- POST /api/salesmen
- PUT /api/salesmen/:id
- PUT /api/salesmen/:id/reset-password
- PUT /api/salesmen/:id/toggle-status

### Sales
- POST /api/sales (Salesman)
- GET /api/sales/my (Salesman)
- DELETE /api/sales/:id (Salesman)
- GET /api/sales/all (Admin)
- GET /api/sales/dashboard (Admin)
- GET /api/sales/daily-report (Admin)
- GET /api/sales/monthly-report (Admin)
- GET /api/sales/branch-report (Admin)
- GET /api/sales/salesman-performance (Admin)
