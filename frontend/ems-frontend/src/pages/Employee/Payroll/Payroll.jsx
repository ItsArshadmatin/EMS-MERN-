import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import Layout from '../../../components/Layout';
import api from '../../../api/axios';

export default function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payroll/my');
      let data = Array.isArray(response.data) ? response.data : [];
      
      // Filter by selected year
      data = data.filter(payroll => 
        parseInt(payroll.year) === parseInt(selectedYear)
      );
      
      setPayrollData(data);
    } catch (error) {
      console.error('Failed to fetch payroll data');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateYearlyTotal = () => {
    const dataArray = Array.isArray(payrollData) ? payrollData : [];
    return dataArray.reduce((total, payroll) => total + parseFloat(payroll.net_salary || 0), 0);
  };

  const getMonthName = (month, year) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${year}`;
  };

  const getCurrentYear = () => new Date().getFullYear();
  const getYearOptions = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <Layout>
      <div className="mb-4">
        <h2>My Payroll</h2>
        <p className="text-muted">View your salary history and payment details</p>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Payroll History</h5>
              <Form.Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ width: 'auto' }}
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div>Loading payroll data...</div>
              ) : payrollData.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Pay Period</th>
                      <th>Base Salary</th>
                      <th>Earnings</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(payrollData) ? payrollData : []).map((payroll) => (
                      <tr key={payroll.id}>
                        <td>{getMonthName(payroll.month, payroll.year)}</td>
                        <td>${payroll.base_salary}</td>
                        <td>${payroll.earnings || 0}</td>
                        <td>${payroll.deductions || 0}</td>
                        <td><strong>${payroll.net_salary}</strong></td>
                        <td>
                          <Badge bg="success">Paid</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-info">
                      <th>Total for {selectedYear}</th>
                      <th colSpan="3"></th>
                      <th><strong>${calculateYearlyTotal().toFixed(2)}</strong></th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
              ) : (
                <p className="text-muted">No payroll records found for {selectedYear}.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Yearly Summary ({selectedYear})</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Total Earnings:</strong>
                <div className="fs-4 text-success">${calculateYearlyTotal().toFixed(2)}</div>
              </div>
              <div className="mb-3">
                <strong>Pay Periods:</strong>
                <div className="text-muted">{payrollData.length} months</div>
              </div>
              <div className="mb-3">
                <strong>Average Monthly:</strong>
                <div className="text-muted">
                  ${payrollData.length > 0 ? (calculateYearlyTotal() / payrollData.length).toFixed(2) : '0.00'}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Latest Payslip</h5>
            </Card.Header>
            <Card.Body>
              {payrollData.length > 0 ? (
                <>
                  <div className="mb-2">
                    <strong>Period:</strong> {getMonthName(payrollData[0].month, payrollData[0].year)}
                  </div>
                  <div className="mb-2">
                    <strong>Base Salary:</strong> ${payrollData[0].base_salary}
                  </div>
                  <div className="mb-2">
                    <strong>Earnings:</strong> ${payrollData[0].earnings || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Deductions:</strong> ${payrollData[0].deductions || 0}
                  </div>
                  <hr />
                  <div className="mb-2">
                    <strong>Net Salary:</strong> 
                    <span className="fs-5 text-success ms-2">${payrollData[0].net_salary}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted">No recent payslip available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
