import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves/all');
      setLeaves(response.data);
    } catch (error) {
      console.error('Failed to fetch leaves');
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/leaves/balance');
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Failed to fetch leave balance');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate dates
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await api.post('/leaves/apply', formData);
      setSuccess('Leave application submitted successfully!');
      fetchLeaves();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to apply for leave');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      leave_type: 'sick',
      start_date: '',
      end_date: '',
      reason: ''
    });
    setError('');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Layout>
      <div className="mb-4">
        <h2>My Leaves</h2>
        <p className="text-muted">Apply for leave and track your leave history</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Leave Applications</h5>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Apply for Leave
              </Button>
            </Card.Header>
            <Card.Body>
              {leaves.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.leave_type}</td>
                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                        <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                        <td>{calculateDays(leave.start_date, leave.end_date)} days</td>
                        <td>{getStatusBadge(leave.status)}</td>
                        <td>{new Date(leave.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No leave applications found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Balance</h5>
            </Card.Header>
            <Card.Body>
              {leaveBalance ? (
                <>
                  <div className="mb-3">
                    <strong>Annual Leave:</strong>
                    <div className="text-muted">{leaveBalance.annual_balance || 0} days remaining</div>
                  </div>
                  <div className="mb-3">
                    <strong>Sick Leave:</strong>
                    <div className="text-muted">{leaveBalance.sick_balance || 0} days remaining</div>
                  </div>
                  <div className="mb-3">
                    <strong>Personal Leave:</strong>
                    <div className="text-muted">{leaveBalance.personal_balance || 0} days remaining</div>
                  </div>
                </>
              ) : (
                <p className="text-muted">Leave balance information not available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Apply Leave Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Leave</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Leave Type *</Form.Label>
              <Form.Select
                value={formData.leave_type}
                onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                required
              >
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                min={getTomorrowDate()}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                min={formData.start_date || getTomorrowDate()}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Please provide a reason for your leave application"
                required
              />
            </Form.Group>

            {formData.start_date && formData.end_date && (
              <Alert variant="info">
                <strong>Total Days:</strong> {calculateDays(formData.start_date, formData.end_date)} days
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}
