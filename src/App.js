import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import HRDashboard from './components/HRDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeForm from './components/EmployeeForm';
import ResetPasswordPage from './components/ResetPasswordPage';
import Layout from './components/Layout';
import EmployeesList from './components/EmployeesList';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out!',
      timer: 1800,
      showConfirmButton: false
    });
    setTimeout(() => setUser(null), 1000);
  };

  if (!user) return (
    <>
      <LoginPage onLogin={setUser} />
    </>
  );

  // First login password reset for all roles
  if (user.firstLogin) {
    // Log the full user object for debugging
    console.log('App.js user object for firstLogin:', user);
    // Pass 'id' for employees, 'username' for others
    if (user.role === 'EMPLOYEE') {
      if (!user.id) {
        return <div style={{color:'red',padding:20}}>Error: No employee id found in user object. Please check backend /employees/login response. User: {JSON.stringify(user)}</div>;
      }
      return (
        <>
          <ResetPasswordPage id={user.id} onReset={handleLogout} />
        </>
      );
    } else {
      // For MANAGER, HR, ADMIN roles
      if (!user.username) {
        return <div style={{color:'red',padding:20}}>Error: No username found in user object. Please check backend /users/login response. User: {JSON.stringify(user)}</div>;
      }
      return (
        <>
          <ResetPasswordPage username={user.username} onReset={handleLogout} />
        </>
      );
    }
  }

  // Employee dashboard route
  if (user.role === 'EMPLOYEE') {
    return (
      <Router>
        <Routes>
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard employeeId={user.id} employeeName={user.name} onLogout={handleLogout} />}
          />
          <Route path="*" element={<Navigate to="/employee/dashboard" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout onLogout={handleLogout} user={user}>
        <Routes>
          <Route
            path="/admin"
            element={user.role === 'ADMIN' ? <AdminDashboard /> : <Unauthorized />}
          />
          <Route
            path="/admin/users"
            element={user.role === 'ADMIN' ? <AdminDashboard /> : <Unauthorized />}
          />
          <Route
            path="/admin/users-list"
            element={user.role === 'ADMIN' ? <EmployeesList /> : <Unauthorized />}
          />
          <Route
            path="/hr"
            element={user.role === 'HR' ? <HRDashboard /> : <Unauthorized />}
          />
          <Route
            path="/hr/employees"
            element={user.role === 'HR' ? <HRDashboard /> : <Unauthorized />}
          />
          <Route
            path="/manager"
            element={user.role === 'MANAGER' ? <ManagerDashboard /> : <Unauthorized />}
          />
          <Route
            path="/manager/team"
            element={user.role === 'MANAGER' ? <ManagerDashboard /> : <Unauthorized />}
          />
          <Route
            path="/manager/leaves"
            element={user.role === 'MANAGER' ? <ManagerDashboard initialNav="leaves" /> : <Unauthorized />}
          />
          <Route
            path="/employee"
            element={user.role === 'HR' || user.role === 'MANAGER' ? <EmployeeForm /> : <Unauthorized />}
          />
          <Route path="*" element={<Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'HR' ? '/hr' : '/manager'} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function Unauthorized() {
  return (
    <div>
      <h2 style={{ color: 'red' }}>Access Denied</h2>
      <p>You are not authorized to view this page.</p>
    </div>
  );
}

export default App;
