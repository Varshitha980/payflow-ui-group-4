import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModernDashboardStyles.css';



const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHR: 0,
    totalManagers: 0,
    disabledUsers: 0,
    totalEmployees: 0,
    recentActions: 0
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersRes = await fetch('http://localhost:8081/api/users');
      const usersData = await usersRes.json();
      const nonAdminUsers = usersData.filter(u => u.role !== 'ADMIN');

      // Load employees
      const employeesRes = await fetch('http://localhost:8081/api/employees');
      const employeesData = await employeesRes.json();
      setEmployees(employeesData);

      // Calculate stats from backend data
      setStats({
        totalUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'active').length,
        totalHR: nonAdminUsers.filter(u => u.role === 'HR').length,
        totalManagers: nonAdminUsers.filter(u => u.role === 'MANAGER').length,
        disabledUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'disabled').length,
        totalEmployees: employeesData.length,
        recentActions: 0 // This would come from a backend endpoint if available
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Admin</h1>
      </div>



      {/* Information Widgets - Bigger Cards */}
      <div className="stats-grid admin-stats">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧑‍💼</div>
          <div className="stat-content">
            <h3>{stats.totalHR}</h3>
            <p>HR Personnel</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>{stats.totalManagers}</h3>
            <p>Managers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.disabledUsers}</h3>
            <p>Disabled Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{getCurrentDate()}</h3>
            <p>Current Date</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn primary"
            onClick={() => navigate('/admin/manage-users')}
          >
            <span>🔐</span>
            <span>Create User</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/manage-users')}
          >
            <span>👥</span>
            <span>Manage Users</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/summary')}
          >
            <span>📈</span>
            <span>Summary</span>
          </button>
        </div>
      </div>




    </div>
  );
};

export default AdminDashboard;
