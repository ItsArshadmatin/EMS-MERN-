import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function AdminPayroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7),
    basic_salary: '',
    overtime_hours: 0,
    overtime_rate: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayrollData();
  }, [selectedMonth, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch employees');
      setEmployees([]);
    }
  };

  const fetchPayrollData = async () => {
    try {
      const response = await api.get('/payroll/all');
      let data = Array.isArray(response.data) ? response.data : [];
      
      // Filter by month if selected
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        data = data.filter(payroll => 
          payroll.year.toString() === year && 
          payroll.month.toString().padStart(2, '0') === month
        );
      }
      
      // Filter by employee if selected
      if (selectedEmployee) {
        data = data.filter(payroll => 
          payroll.employee_id.toString() === selectedEmployee
        );
      }
      
      setPayrollData(data);
    } catch (error) {
      setError('Failed to fetch payroll data');
      setPayrollData([]);
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [year, month] = generateForm.month.split('-');
      const payrollData = {
        employee_id: generateForm.employee_id,
        month: parseInt(month),
        year: parseInt(year)
      };
      
      await api.post('/payroll/generate', payrollData);
      setSuccess('Payroll generated successfully');
      fetchPayrollData();
      setShowGenerateModal(false);
      resetGenerateForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate payroll');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForAll = async () => {
    if (window.confirm('Generate payroll for all employees for this month?')) {
      setLoading(true);
      try {
        await api.post('/payroll/generate-all', { 
          month: selectedMonth.split('-')[1], // Extract month from YYYY-MM
          year: selectedMonth.split('-')[0]   // Extract year from YYYY-MM
        });
        setSuccess('Payroll generated for all employees');
        fetchPayrollData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to generate payroll for all');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetGenerateForm = () => {
    setGenerateForm({
      employee_id: '',
      month: new Date().toISOString().slice(0, 7),
      basic_salary: '',
      overtime_hours: 0,
      overtime_rate: 0,
      deductions: 0
    });
  };

  return (
    <Layout>
      <div className="mb-4">
        <h2>Payroll Management</h2>
        <p className="text-muted">Generate and manage employee payroll</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Month</Form.Label>
                <Form.Control
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
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
            <Col md={3}>
              <Button 
                variant="primary" 
                onClick={() => setShowGenerateModal(true)}
                className="me-2"
              >
                Generate Payroll
              </Button>
            </Col>
            <Col md={3}>
              <Button 
                variant="success" 
                onClick={handleGenerateForAll}
                disabled={loading}
              >
                Generate for All
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table responsive striped>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Pay Period</th>
            <th>Base Salary</th>
            <th>Earnings</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Generated On</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(payrollData) ? payrollData : []).map((payroll) => (
            <tr key={payroll.id}>
              <td>{payroll.employee_name || 'N/A'}</td>
              <td>{payroll.month}/{payroll.year}</td>
              <td>${payroll.base_salary}</td>
              <td>${payroll.earnings || 0}</td>
              <td>${payroll.deductions || 0}</td>
              <td><strong>${payroll.net_salary}</strong></td>
              <td>{new Date(payroll.generated_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {payrollData.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No payroll records found for the selected criteria.</p>
        </div>
      )}

      {/* Generate Payroll Modal */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Payroll</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGeneratePayroll}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Employee *</Form.Label>
              <Form.Select
                value={generateForm.employee_id}
                onChange={(e) => setGenerateForm({...generateForm, employee_id: e.target.value})}
                required
              >
                <option value="">Select Employee</option>
                {(Array.isArray(employees) ? employees : []).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Month *</Form.Label>
              <Form.Control
                type="month"
                value={generateForm.month}
                onChange={(e) => setGenerateForm({...generateForm, month: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Basic Salary *</Form.Label>
              <Form.Control
                type="number"
                value={generateForm.basic_salary}
                onChange={(e) => setGenerateForm({...generateForm, basic_salary: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Overtime Hours</Form.Label>
              <Form.Control
                type="number"
                value={generateForm.overtime_hours}
                onChange={(e) => setGenerateForm({...generateForm, overtime_hours: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Overtime Rate (per hour)</Form.Label>
              <Form.Control
                type="number"
                value={generateForm.overtime_rate}
                onChange={(e) => setGenerateForm({...generateForm, overtime_rate: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deductions</Form.Label>
              <Form.Control
                type="number"
                value={generateForm.deductions}
                onChange={(e) => setGenerateForm({...generateForm, deductions: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}
