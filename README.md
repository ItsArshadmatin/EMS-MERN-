# Employee Management System (EMS)

A full-stack Employee Management System built with Node.js, Express, MySQL, and React.

## Features

### Admin Features
- **Dashboard**: Overview with statistics and recent activities
- **Employee Management**: Add, edit, delete, and search employees
- **Department Management**: Manage company departments
- **Attendance Tracking**: Monitor employee attendance
- **Leave Management**: Approve/reject leave requests
- **Payroll Management**: Generate and manage employee payroll

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
