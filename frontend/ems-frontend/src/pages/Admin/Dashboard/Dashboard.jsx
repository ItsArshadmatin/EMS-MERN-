// dashboard main file 
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import StatsCard from "../../../components/StatsCard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch total employees
        const empRes = await api.get("/employees?page=1&limit=1");
        const totalEmployees = empRes.data.count || 0;

        // Fetch today's attendance
        const attRes = await api.get("/attendance/status-today");
        const presentToday = attRes.data.presentCount || 0;

        // Fetch pending leaves
        const leaveRes = await api.get("/leave/all?status=pending");
        const pendingLeaves = leaveRes.data.count || 0;

        setStats({
          totalEmployees,
          presentToday,
          pendingLeaves,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <StatsCard label="Total Employees" value={stats.totalEmployees} />
        <StatsCard label="Present Today" value={stats.presentToday} />
        <StatsCard label="Pending Leaves" value={stats.pendingLeaves} />
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: "40px" }}>
        <h3>Quick Actions</h3>
        <button style={btn}>Add Employee</button>
        <button style={btn}>Generate Payroll</button>
        <button style={btn}>Post Job (ATS)</button>
      </div>
    </div>
  );
}

const btn = {
  padding: "10px 20px",
  marginRight: "15px",
  cursor: "pointer",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
};
