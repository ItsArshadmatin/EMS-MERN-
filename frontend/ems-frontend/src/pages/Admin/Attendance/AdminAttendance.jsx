import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function AdminAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceData();
  }, [selectedDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch employees');
      setEmployees([]);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/all');
      let data = Array.isArray(response.data) ? response.data : [];
      
      // Filter by selected date only if a date is selected
      if (selectedDate) {
        data = data.filter(record => 
          new Date(record.date).toISOString().split('T')[0] === selectedDate
        );
      }
      
      // Filter by selected employee if specified
      if (selectedEmployee) {
        data = data.filter(record => 
          record.employee_id.toString() === selectedEmployee
        );
      }
      
      setAttendanceData(data);
    } catch (error) {
      console.error('Failed to fetch attendance data');
      setAttendanceData([]);
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
    return <Badge bg={variants[status] || 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredData = Array.isArray(attendanceData) ? attendanceData : [];

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
                  {(Array.isArray(employees) ? employees : []).map(emp => (
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
            {(Array.isArray(filteredData) ? filteredData : []).map((record) => (
              <tr key={`${record.id}-${record.date}`}>
                <td>{record.employee_name}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.check_in || 'Not checked in'}</td>
                <td>{record.check_out || 'Not checked out'}</td>
                <td>{record.total_hours} hours</td>
                <td>{getStatusBadge(record.status.toLowerCase())}</td>
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
