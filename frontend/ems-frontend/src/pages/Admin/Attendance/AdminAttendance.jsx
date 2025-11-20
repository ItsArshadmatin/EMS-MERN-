import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function AdminAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceData();
  }, [selectedDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in your backend
      // For now, we'll create mock data based on employees
      const mockAttendance = employees.map(emp => ({
        id: emp.id,
        employee_name: emp.name,
        date: selectedDate,
        check_in: Math.random() > 0.2 ? '09:00:00' : null,
        check_out: Math.random() > 0.3 ? '17:30:00' : null,
        status: Math.random() > 0.2 ? 'present' : 'absent',
        hours_worked: Math.random() > 0.2 ? '8.5' : '0'
      }));
      
      setAttendanceData(mockAttendance);
    } catch (error) {
      console.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: 'success',
      absent: 'danger',
      late: 'warning',
      half_day: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredData = selectedEmployee 
    ? attendanceData.filter(record => record.id.toString() === selectedEmployee)
    : attendanceData;

  return (
    <Layout>
      <div className="mb-4">
        <h2>Attendance Management</h2>
        <p className="text-muted">Monitor employee attendance and working hours</p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Select Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Employee</Form.Label>
                <Form.Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div>Loading attendance data...</div>
      ) : (
        <Table responsive striped>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours Worked</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={`${record.id}-${record.date}`}>
                <td>{record.employee_name}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.check_in || 'Not checked in'}</td>
                <td>{record.check_out || 'Not checked out'}</td>
                <td>{record.hours_worked} hours</td>
                <td>{getStatusBadge(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {filteredData.length === 0 && !loading && (
        <div className="text-center py-4">
          <p className="text-muted">No attendance records found for the selected criteria.</p>
        </div>
      )}
    </Layout>
  );
}
