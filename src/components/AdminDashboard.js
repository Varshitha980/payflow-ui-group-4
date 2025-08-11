import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModernDashboardStyles.css'; // Assuming this CSS file exists and contains the necessary styles
import API from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHR: 0,
    totalManagers: 0,
    disabledUsers: 0,
    totalEmployees: 0, // This will hold the count of all employees
    overallUsers: 0,   // New state for overall users (HR + Managers)
    recentActions: 0
  });
  const [employees, setEmployees] = useState([]); // State to store employee data
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [showCreateForm, setShowCreateForm] = useState(false); // State to control create user form visibility
  const [form, setForm] = useState({ username: '', password: '', role: 'HR' }); // State for create user form
  const [msg, setMsg] = useState(''); // State for success/error messages

  const navigate = useNavigate(); // Hook for navigation

  // useEffect to load dashboard data when the component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Function to fetch data from the backend APIs
  const loadDashboardData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      // Fetch users data using the API utility
      const usersRes = await API.get('/users');
      const usersData = usersRes.data || [];
      // Filter out admin users as per the problem statement's context for user stats
      const nonAdminUsers = usersData.filter(u => u.role !== 'ADMIN');

      // Fetch employees data
      const employeesRes = await API.get('/employees'); // Using API utility for consistency
      const employeesData = employeesRes.data || [];
      setEmployees(employeesData); // Store employee data in state

      // Calculate individual user roles
      const totalHR = nonAdminUsers.filter(u => u.role === 'HR').length;
      const totalManagers = nonAdminUsers.filter(u => u.role === 'MANAGER').length;

      // Calculate and set the dashboard statistics
      setStats({
        totalUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'active').length,
        totalHR: totalHR,
        totalManagers: totalManagers,
        disabledUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'disabled').length,
        totalEmployees: employeesData.length, // Total count of all employees
        overallUsers: totalHR + totalManagers, // Calculate overall users
        recentActions: 0 // Placeholder, would typically come from a backend endpoint
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // In a real application, you might want to display an error message to the user
    } finally {
      setLoading(false); // Set loading to false after data is fetched or an error occurs
    }
  };

  // Function to get the current date in a formatted string
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to handle user creation
  const handleCreate = async () => {
    try {
      await API.post('/users/create', form);
      setMsg(`User "${form.username}" created successfully!`);
      setForm({ username: '', password: '', role: 'HR' });
      setShowCreateForm(false);
      loadDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error creating user:', error);
      setMsg('Error creating user');
    }
  };

  // Display a loading message while data is being fetched
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

      {/* Information Widgets - Arranged in 2 rows (4 in first, 3 in second) */}
      <div className="stats-grid admin-stats">
        {/* Row 1: Active Users, HR Personnel, Managers, Disabled Users */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
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
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.disabledUsers}</h3>
            <p>Disabled Users</p>
          </div>
        </div>

        {/* Row 2: Employees, Current Date, Overall Users */}
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{getCurrentDate()}</h3>
            <p>Current Date</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <h3>{stats.overallUsers}</h3>
            <p>Overall Users</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn primary"
            onClick={() => setShowCreateForm(true)}
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
      
      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {msg && <div className="alert">{msg}</div>}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="HR">HR</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
