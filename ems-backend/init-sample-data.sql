-- Sample data initialization for EMS
USE ems_db;

-- Create a sample employee user (password: employee123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('John Doe', 'john@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('Jane Smith', 'jane@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

-- Create employee profiles for the users
INSERT IGNORE INTO employees (user_id, department_id, designation, base_salary, date_of_joining, is_active) 
SELECT u.id, 2, 'Software Developer', 50000.00, '2024-01-15', 1 
FROM users u WHERE u.email = 'john@company.com';

INSERT IGNORE INTO employees (user_id, department_id, designation, base_salary, date_of_joining, is_active) 
SELECT u.id, 1, 'HR Manager', 60000.00, '2024-01-10', 1 
FROM users u WHERE u.email = 'jane@company.com';

-- Create leave balances for employees
INSERT IGNORE INTO leave_balance (employee_id, leave_type_id, total_days, used_days)
SELECT e.id, lt.id, lt.default_days, 0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.user_id IN (
    SELECT id FROM users WHERE email IN ('john@company.com', 'jane@company.com')
);

-- Create admin employee profile if not exists
INSERT IGNORE INTO employees (user_id, department_id, designation, base_salary, date_of_joining, is_active) 
SELECT u.id, 1, 'System Administrator', 80000.00, '2024-01-01', 1 
FROM users u WHERE u.email = 'admin@company.com';

-- Create leave balances for admin
INSERT IGNORE INTO leave_balance (employee_id, leave_type_id, total_days, used_days)
SELECT e.id, lt.id, lt.default_days, 0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.user_id IN (
    SELECT id FROM users WHERE email = 'admin@company.com'
);
