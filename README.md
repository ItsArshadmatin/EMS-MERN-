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

CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

-- ----------------------------
-- Table: users
-- ----------------------------
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table: departments
-- ----------------------------
CREATE TABLE departments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1
);

-- ----------------------------
-- Table: employees
-- ----------------------------
CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT,
    designation VARCHAR(150),
    base_salary DECIMAL(12,2) DEFAULT 0.00,
    date_of_joining DATE,
    is_active TINYINT(1) DEFAULT 1,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ----------------------------
-- Table: attendance
-- ----------------------------
CREATE TABLE attendance (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    total_hours DECIMAL(5,2) DEFAULT 0.00,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Half-Day') DEFAULT 'Present',

    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ----------------------------
-- Table: leave_types
-- ----------------------------
CREATE TABLE leave_types (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_days INT NOT NULL
);

-- ----------------------------
-- Table: leave_balance
-- ----------------------------
CREATE TABLE leave_balance (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    total_days INT NOT NULL,
    used_days INT NOT NULL DEFAULT 0,

    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

-- ----------------------------
-- Table: leaves
-- ----------------------------
CREATE TABLE leaves (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

-- ----------------------------
-- Table: payroll
-- ----------------------------
CREATE TABLE payroll (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    total_hours DECIMAL(10,2) NOT NULL,
    per_hour_rate DECIMAL(10,2) NOT NULL,
    earnings DECIMAL(10,2) NOT NULL,
    deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ----------------------------
-- Table: payroll_records
-- ----------------------------
CREATE TABLE payroll_records (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    payable_salary DECIMAL(10,2) NOT NULL,
    total_working_days INT NOT NULL,
    present_days INT NOT NULL,
    leave_days INT NOT NULL,
    lop_days INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
