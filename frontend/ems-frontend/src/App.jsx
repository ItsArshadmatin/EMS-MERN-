// main app file 
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Employees from "./pages/Admin/Employees/Employees";
import Departments from "./pages/Admin/Departments/Departments";
import AdminAttendance from "./pages/Admin/Attendance/AdminAttendance";
import AdminLeaves from "./pages/Admin/Leaves/AdminLeaves";
import AdminPayroll from "./pages/Admin/Payroll/AdminPayroll";
import Jobs from "./pages/Admin/Jobs/Jobs";

// Employee pages
import Profile from "./pages/Employee/Profile/Profile";
import EmpAttendance from "./pages/Employee/Attendance/Attendance";
import EmpLeaves from "./pages/Employee/Leaves/Leaves";
import EmpPayroll from "./pages/Employee/Payroll/Payroll";

export default function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <AdminRoute>
            <Employees />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/departments"
        element={
          <AdminRoute>
            <Departments />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/attendance"
        element={
          <AdminRoute>
            <AdminAttendance />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/leaves"
        element={
          <AdminRoute>
            <AdminLeaves />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/payroll"
        element={
          <AdminRoute>
            <AdminPayroll />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <AdminRoute>
            <Jobs />
          </AdminRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/me/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/attendance"
        element={
          <ProtectedRoute>
            <EmpAttendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/leaves"
        element={
          <ProtectedRoute>
            <EmpLeaves />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/payroll"
        element={
          <ProtectedRoute>
            <EmpPayroll />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
