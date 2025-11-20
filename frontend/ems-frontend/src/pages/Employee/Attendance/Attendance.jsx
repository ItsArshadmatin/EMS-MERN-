import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Row, Col, Badge } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function Attendance() {
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceHistory();
    fetchMonthlySummary();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/status-today');
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch today status');
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await api.get('/attendance/history');
      setAttendanceHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance history');
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const response = await api.get('/attendance/summary');
      setMonthlySummary(response.data);
    } catch (error) {
      console.error('Failed to fetch monthly summary');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/attendance/check-in');
      setSuccess('Checked in successfully!');
      fetchTodayStatus();
      fetchAttendanceHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check in');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/attendance/check-out');
      setSuccess('Checked out successfully!');
      fetchTodayStatus();
      fetchAttendanceHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check out');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not recorded';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="mb-4">
        <h2>My Attendance</h2>
        <p className="text-muted">Track your daily attendance and view history</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Today's Attendance - {new Date().toLocaleDateString()}</h5>
            </Card.Header>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Current Time:</strong>
                    <div className="fs-4 text-primary">{getCurrentTime()}</div>
                  </div>
                  
                  {todayStatus && (
                    <>
                      <div className="mb-2">
                        <strong>Check In:</strong> {formatTime(todayStatus.check_in)}
                      </div>
                      <div className="mb-2">
                        <strong>Check Out:</strong> {formatTime(todayStatus.check_out)}
                      </div>
                      {todayStatus.hours_worked && (
                        <div className="mb-2">
                          <strong>Hours Worked:</strong> {todayStatus.hours_worked}
                        </div>
                      )}
                    </>
                  )}
                </Col>
                
                <Col md={6} className="text-end">
                  {!todayStatus?.check_in ? (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCheckIn}
                      disabled={loading}
                    >
                      {loading ? 'Checking In...' : 'Check In'}
                    </Button>
                  ) : !todayStatus?.check_out ? (
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={handleCheckOut}
                      disabled={loading}
                    >
                      {loading ? 'Checking Out...' : 'Check Out'}
                    </Button>
                  ) : (
                    <Badge bg="success" className="fs-6 p-3">
                      Day Complete
                    </Badge>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">This Month Summary</h5>
            </Card.Header>
            <Card.Body>
              {monthlySummary ? (
                <>
                  <div className="mb-2">
                    <strong>Days Present:</strong> {monthlySummary.days_present || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Days Absent:</strong> {monthlySummary.days_absent || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Total Hours:</strong> {monthlySummary.total_hours || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Average Hours/Day:</strong> {monthlySummary.avg_hours || 0}
                  </div>
                </>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Attendance History</h5>
        </Card.Header>
        <Card.Body>
          {attendanceHistory.length > 0 ? (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Worked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{formatTime(record.check_in)}</td>
                    <td>{formatTime(record.check_out)}</td>
                    <td>{record.hours_worked || 'N/A'}</td>
                    <td>
                      <Badge bg={record.check_in ? 'success' : 'danger'}>
                        {record.check_in ? 'Present' : 'Absent'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No attendance records found.</p>
          )}
        </Card.Body>
      </Card>
    </Layout>
  );
}
