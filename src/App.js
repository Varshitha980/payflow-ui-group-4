import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import HRDashboard from './components/HRDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeForm from './components/EmployeeForm';
import ResetPasswordPage from './components/ResetPasswordPage';
import Layout from './components/Layout';

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

  if (user.firstLogin && user.role !== 'ADMIN') {
    return (
      <>
        <ResetPasswordPage username={user.username} onReset={handleLogout} />
      </>
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
