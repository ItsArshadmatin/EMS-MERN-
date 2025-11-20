import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    presentToday: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, departmentsRes, leavesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/leaves/all')
      ]);

      setStats({
        totalEmployees: employeesRes.data.length,
        totalDepartments: departmentsRes.data.length,
        pendingLeaves: leavesRes.data.filter(leave => leave.status === 'pending').length,
        presentToday: Math.floor(Math.random() * employeesRes.data.length) // Mock data
      });

      setRecentLeaves(leavesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center">
        <div className="flex-grow-1">
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className={`text-${color} mb-0`}>{value}</h3>
        </div>
        <div className={`text-${color} fs-1`}>{icon}</div>
      </Card.Body>
    </Card>
  );

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h2>Admin Dashboard</h2>
        <p className="text-muted">Overview of your Employee Management System</p>
      </div>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon="👥"
            color="primary"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon="🏢"
            color="success"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon="📅"
            color="warning"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon="✅"
            color="info"
          />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Leave Requests</h5>
            </Card.Header>
            <Card.Body>
              {recentLeaves.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.employee_name || 'N/A'}</td>
                        <td>{leave.leave_type}</td>
                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                        <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                        <td>
                          <Badge 
                            bg={
                              leave.status === 'approved' ? 'success' :
                              leave.status === 'rejected' ? 'danger' : 'warning'
                            }
                          >
                            {leave.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No recent leave requests</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
