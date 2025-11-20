import React from 'react';
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/departments', label: 'Departments', icon: '🏢' },
    { path: '/admin/attendance', label: 'Attendance', icon: '⏰' },
    { path: '/admin/leaves', label: 'Leaves', icon: '📅' },
    { path: '/admin/payroll', label: 'Payroll', icon: '💰' }
  ];

  const employeeLinks = [
    { path: '/me/profile', label: 'Profile', icon: '👤' },
    { path: '/me/attendance', label: 'Attendance', icon: '⏰' },
    { path: '/me/leaves', label: 'Leaves', icon: '📅' },
    { path: '/me/payroll', label: 'Payroll', icon: '💰' }
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand>EMS</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <span className="navbar-text me-3">
              Welcome, {user?.name} ({user?.role})
            </span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="flex-grow-1">
        <Row className="h-100">
          <Col md={2} className="bg-light p-0">
            <div className="sidebar p-3">
              <Nav className="flex-column">
                {links.map(link => (
                  <Nav.Link
                    key={link.path}
                    as={Link}
                    to={link.path}
                    className={`mb-2 ${isActive(link.path) ? 'bg-primary text-white rounded' : ''}`}
                  >
                    <span className="me-2">{link.icon}</span>
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </div>
          </Col>
          <Col md={10} className="p-4">
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
