import React from 'react';
import { Card } from 'react-bootstrap';
import Layout from '../../../components/Layout';

export default function Jobs() {
  return (
    <Layout>
      <div className="mb-4">
        <h2>Jobs Management</h2>
        <p className="text-muted">Manage job positions and requirements</p>
      </div>

      <Card>
        <Card.Body className="text-center py-5">
          <h4>Jobs Management</h4>
          <p className="text-muted">This feature is coming soon. You can extend this to manage job postings, requirements, and applications.</p>
        </Card.Body>
      </Card>
    </Layout>
  );
}
