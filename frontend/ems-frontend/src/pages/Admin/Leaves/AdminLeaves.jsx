import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Form, Row, Col } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, statusFilter]);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves/all');
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError('Failed to fetch leave requests');
      setLeaves([]);
    }
  };

  const filterLeaves = () => {
    const leavesArray = Array.isArray(leaves) ? leaves : [];
    if (statusFilter === 'all') {
      setFilteredLeaves(leavesArray);
    } else {
      setFilteredLeaves(leavesArray.filter(leave => leave.status === statusFilter));
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await api.put(`/leaves/approve/${leaveId}`, { status: 'approved' });
      setSuccess('Leave request approved successfully');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to approve leave');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await api.put(`/leaves/reject/${leaveId}`, { status: 'rejected' });
      setSuccess('Leave request rejected successfully');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reject leave');
      setTimeout(() => setError(''), 3000);
    }
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

  return (
    <Layout>
      <div className="mb-4">
        <h2>Leave Management</h2>
        <p className="text-muted">Manage employee leave requests</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Table responsive striped>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Applied On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(filteredLeaves) ? filteredLeaves : []).map((leave) => (
            <tr key={leave.id}>
              <td>{leave.employee_name || 'N/A'}</td>
              <td>{leave.leave_type}</td>
              <td>{new Date(leave.start_date).toLocaleDateString()}</td>
              <td>{new Date(leave.end_date).toLocaleDateString()}</td>
              <td>{calculateDays(leave.start_date, leave.end_date)} days</td>
              <td>
                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leave.reason}
                </div>
              </td>
              <td>{getStatusBadge(leave.status)}</td>
              <td>{new Date(leave.applied_at).toLocaleDateString()}</td>
              <td>
                {leave.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApprove(leave.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(leave.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {leave.status !== 'pending' && (
                  <span className="text-muted">No actions available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredLeaves.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No leave requests found.</p>
        </div>
      )}
    </Layout>
  );
}
