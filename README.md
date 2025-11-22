# Employee Management System (EMS)

A full-stack Employee Management System built with Node.js, Express, MySQL, and React.

## 🎯 Project Overview

The Employee Management System (EMS) is a comprehensive web application designed to streamline HR operations and employee management processes. It provides separate interfaces for administrators and employees, enabling efficient management of attendance, payroll, leave requests, and employee data.

### 🏗️ System Architecture

**Frontend (Client-Side):**
- **React 19** - Modern UI library with hooks and functional components
- **React Router DOM** - Client-side routing and navigation
- **Bootstrap 5 & React Bootstrap** - Responsive UI components and styling
- **Axios** - HTTP client for API communication
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and development server

**Backend (Server-Side):**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MySQL2** - Database driver for MySQL
- **JWT (JSON Web Tokens)** - Authentication and authorization
- **bcryptjs** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

**Database:**
- **MySQL** - Relational database management system
- **Structured schema** with proper relationships and constraints

## Features

### Admin Features
- **Dashboard**: Overview with statistics and recent activities
- **Employee Management**: Add, edit, delete, and search employees
- **Department Management**: Manage company departments
- **Attendance Tracking**: Monitor employee attendance with real-time data
- **Leave Management**: Approve/reject leave requests with status tracking
- **Payroll Management**: Generate and manage employee payroll with automatic calculations

### Employee Features
- **Profile Management**: View and update personal information
- **Attendance**: Check-in/check-out and view attendance history
- **Leave Applications**: Apply for leave and track status
- **Payroll**: View salary history and payslips

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM
- Bootstrap 5
- React Bootstrap
- Axios for API calls
- Zustand for state management

## 📚 Learning Topics & Technologies Used

### **Core Web Development Concepts**
1. **Full-Stack Development** - Understanding client-server architecture
2. **RESTful API Design** - Creating and consuming REST APIs
3. **Database Design** - Relational database modeling and normalization
4. **Authentication & Authorization** - JWT-based security implementation
5. **State Management** - Managing application state across components
6. **Responsive Design** - Creating mobile-friendly interfaces

### **Frontend Technologies & Concepts**
1. **React Fundamentals**
   - Functional Components & Hooks (useState, useEffect)
   - Component Lifecycle Management
   - Props and State Management
   - Event Handling and Form Management
   - Conditional Rendering and Lists

2. **React Ecosystem**
   - React Router DOM (Navigation & Routing)
   - Axios (HTTP Requests & API Integration)
   - Zustand (State Management)
   - React Bootstrap (UI Components)

3. **Modern JavaScript (ES6+)**
   - Arrow Functions & Template Literals
   - Destructuring & Spread Operator
   - Async/Await & Promises
   - Modules (Import/Export)
   - Array Methods (map, filter, reduce)

4. **CSS & Styling**
   - Bootstrap 5 Framework
   - Responsive Grid System
   - Component Styling
   - CSS Flexbox & Grid

### **Backend Technologies & Concepts**
1. **Node.js & Express.js**
   - Server Setup & Configuration
   - Middleware Implementation
   - Route Handling & Controllers
   - Error Handling & Validation
   - CORS Configuration

2. **Database Management**
   - MySQL Database Design
   - SQL Queries (SELECT, INSERT, UPDATE, DELETE)
   - Database Relationships (Foreign Keys)
   - Connection Pooling
   - Data Validation & Sanitization

3. **Security & Authentication**
   - JWT Token Generation & Verification
   - Password Hashing with bcrypt
   - Protected Routes & Middleware
   - Role-Based Access Control (RBAC)
   - Input Validation & Sanitization

4. **API Development**
   - RESTful API Principles
   - HTTP Methods & Status Codes
   - Request/Response Handling
   - JSON Data Format
   - API Documentation

### **Development Tools & Practices**
1. **Version Control** - Git & GitHub
2. **Package Management** - npm
3. **Environment Configuration** - dotenv
4. **Development Server** - Vite (Frontend), Nodemon (Backend)
5. **Code Organization** - MVC Pattern, Modular Structure
6. **Debugging** - Browser DevTools, Server Logging

### **Database Schema & Relationships**
1. **Tables**: users, employees, departments, attendance, leaves, payroll
2. **Relationships**: One-to-Many, Many-to-One
3. **Constraints**: Primary Keys, Foreign Keys, Unique Constraints
4. **Data Types**: VARCHAR, INT, DECIMAL, DATE, TIMESTAMP, ENUM

### **Key Features Implementation**
1. **Authentication System** - Login/Register with JWT
2. **Role-Based Access** - Admin vs Employee permissions
3. **CRUD Operations** - Create, Read, Update, Delete functionality
4. **Data Filtering & Search** - Dynamic data filtering
5. **Form Handling** - Input validation and submission
6. **Real-time Updates** - Dynamic data refresh
7. **Responsive UI** - Mobile-friendly design

## 🎓 Skills You'll Learn to Explain This Project

### **Technical Skills**
1. **Full-Stack Development Workflow**
2. **Database Design & Management**
3. **API Development & Integration**
4. **Authentication & Security Implementation**
5. **Frontend Framework Usage (React)**
6. **Backend Framework Usage (Express.js)**
7. **State Management Patterns**
8. **Responsive Web Design**

### **Soft Skills**
1. **Project Architecture Planning**
2. **Problem-Solving & Debugging**
3. **Code Organization & Best Practices**
4. **User Experience (UX) Considerations**
5. **System Design Thinking**

### **Interview Topics You Can Discuss**
1. **How you structured the database schema**
2. **JWT authentication implementation**
3. **React component architecture**
4. **API design decisions**
5. **Security measures implemented**
6. **Performance optimization techniques**
7. **Error handling strategies**
8. **User role management**
9. **Data validation approaches**
10. **Responsive design implementation**

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ems-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database configuration:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=ems_db
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

4. Create the MySQL database and tables (you'll need to create the schema based on your controllers)

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/ems-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file for the frontend:
   ```env
   VITE_API_BASE=http://localhost:4000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both backend and frontend servers
2. Open your browser and go to `http://localhost:5173`
3. Register a new account or login with existing credentials
4. Admin users can access all features, employees have limited access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/protected` - Protected route test

### Employees (Admin only)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments (Admin only)
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/status-today` - Get today's status
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/summary` - Get monthly summary
- `GET /api/attendance/all` - Get all attendance records (Admin)

### Leaves
- `POST /api/leaves/apply` - Apply for leave
- `PUT /api/leaves/approve/:id` - Approve leave (Admin)
- `PUT /api/leaves/reject/:id` - Reject leave (Admin)
- `GET /api/leaves/all` - Get all leaves
- `GET /api/leaves/balance` - Get leave balance

### Payroll
- `POST /api/payroll/generate` - Generate payroll (Admin)
- `POST /api/payroll/generate-all` - Generate for all employees (Admin)
- `GET /api/payroll/my` - Get employee's payroll
- `GET /api/payroll/all` - Get all payroll (Admin)

## Default Login Credentials

After setting up, you can create admin and employee accounts through the registration page.

## 🧪 Test Credentials

For testing purposes, you can use these sample accounts:

### Admin Account
- **Email:** `admin@company.com`
- **Password:** `password`
- **Access:** Full system access including employee management, payroll generation, leave approvals

### Employee Accounts
- **Email:** `john@company.com` | **Password:** `password`
- **Email:** `jane@company.com` | **Password:** `password`
- **Email:** `test1@gmail.com` | **Password:** `password`
- **Access:** Employee dashboard with attendance, leave applications, payroll viewing

### Sample Data Available
- ✅ **Employees:** 6 sample employees across different departments
- ✅ **Departments:** IT, HR, Finance, Operations
- ✅ **Attendance Records:** Multiple days of sample attendance data
- ✅ **Leave Applications:** Various leave requests with different statuses
- ✅ **Payroll Records:** Generated payroll for November 2025
- ✅ **Leave Types:** Sick Leave, Casual Leave, Annual Leave

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and basic info
- **employees** - Employee profiles and job details
- **departments** - Company departments
- **attendance** - Daily attendance records
- **leaves** - Leave applications and approvals
- **payroll** - Salary calculations and records
- **leave_types** - Types of leaves available
- **leave_balance** - Employee leave balances

## 🚀 Key Features Implemented

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Protected routes and middleware
- Password hashing with bcrypt

### Employee Management
- Complete CRUD operations
- Employee profile management
- Department assignment
- Search and filtering capabilities

### Attendance System
- Real-time check-in/check-out
- Attendance history tracking
- Monthly summaries and reports
- Admin oversight of all attendance

### Leave Management
- Leave application system
- Approval workflow
- Leave balance tracking
- Multiple leave types support

### Payroll System
- Automated payroll generation
- Salary calculations based on attendance
- Bulk payroll processing
- Payroll history and reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
