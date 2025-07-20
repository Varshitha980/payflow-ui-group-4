import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHR: 0,
    totalManagers: 0,
    disabledUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'HR' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users');
      const data = await res.json();
      setUsers(data);
      setStats({
        totalUsers: data.filter(u => u.status === 'Active').length,
        totalHR: data.filter(u => u.role === 'HR').length,
        totalManagers: data.filter(u => u.role === 'MANAGER').length,
        disabledUsers: data.filter(u => u.status === 'Disabled').length
      });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await API.post('/create', form);
      setMsg(`User "${form.username}" created successfully!`);
      setForm({ username: '', password: '', role: 'HR' });
      setShowCreateForm(false);
      loadUsers();
    } catch {
      setMsg('Error creating user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
      // await API.put(`/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setMsg(`User status updated to ${newStatus}`);
    } catch {
      setMsg('Error updating user status');
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to your control center</p>
      </div>

      {msg && (
        <div className="alert alert-success">
          {msg}
          <button onClick={() => setMsg('')} className="alert-close">×</button>
        </div>
      )}

      {/* Information Widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧑‍💼</div>
          <div className="stat-content">
            <h3>{stats.totalHR}</h3>
            <p>Total HRs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>{stats.totalManagers}</h3>
            <p>Total Managers</p>
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
        <div className="stat-card">
          <div className="stat-icon">🔁</div>
          <div className="stat-content">
            <h3>5</h3>
            <p>Recent Actions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn primary"
            onClick={() => setShowCreateForm(true)}
          >
            <span>🔐</span>
            <span>Create New User (HR/Manager)</span>
          </button>
          <button className="quick-action-btn">
            <span>📊</span>
            <span>Generate Reports</span>
          </button>
          <button className="quick-action-btn">
            <span>⚙️</span>
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="table-section">
        <div className="table-header">
          <h2>User Management</h2>
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
            />
            <button className="btn-secondary">Export</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username || user.name}</td>
                  <td>
                    <span className={`role-badge ${user.role ? user.role.toLowerCase() : ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.status ? user.status.toLowerCase() : ''}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.status === 'Active' ? (
                        <button 
                          className="btn-danger small"
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                          🔒 Disable
                        </button>
                      ) : (
                        <button 
                          className="btn-success small"
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                          🔓 Enable
                        </button>
                      )}
                      <button className="btn-secondary small">Edit</button>
                      <button className="btn-secondary small">Reset</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input
                  type="password"
                  placeholder="Enter temporary password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreate}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips Panel */}
      <div className="tips-panel">
        <h3>💡 Tips & Notes</h3>
        <ul>
          <li>You can create credentials for HR/Managers here.</li>
          <li>Follow secure password practices when creating temporary passwords.</li>
          <li>Monitor user activity and status regularly.</li>
          <li>Use the search function to quickly find specific users.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
