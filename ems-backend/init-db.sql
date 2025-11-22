-- Insert default leave types
INSERT INTO leave_types (name, default_days) VALUES 
('Annual Leave', 21),
('Sick Leave', 10),
('Casual Leave', 12),
('Maternity Leave', 90),
('Paternity Leave', 15);

-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('Human Resources', 'Manages employee relations and policies'),
('Information Technology', 'Handles technology infrastructure and development'),
('Finance', 'Manages financial operations and accounting'),
('Marketing', 'Handles marketing and promotional activities'),
('Operations', 'Manages day-to-day business operations');

-- Create admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
