import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import EmployeesList from './EmployeesList';

const USERS_PER_PAGE = 10;

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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users');
      const data = await res.json();
      const nonAdminUsers = data.filter(u => u.role !== 'ADMIN');
      setUsers(nonAdminUsers);
      setStats({
        totalUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'active').length,
        totalHR: nonAdminUsers.filter(u => u.role === 'HR').length,
        totalManagers: nonAdminUsers.filter(u => u.role === 'MANAGER').length,
        disabledUsers: nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'disabled').length
      });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await API.post('/users/create', form);
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
      await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setMsg(`User status updated to ${newStatus}`);
      loadUsers();
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

  // Filter users by search string (case-insensitive)
  const filteredUsers = users.filter(user =>
    user.username && user.username.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    // Reset to first page if search changes
    setPage(1);
  }, [search]);

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
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="data-table" style={{ fontSize: '22px' }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username || user.name}</td>
                  <td>
                    <span className={`role-badge ${user.role ? user.role.toLowerCase() : ''}`}>
                      {user.role}
                    </span>
                  </td>
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
       {/* Pagination Controls */}
       <div className="custom-pagination" style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  gap: 4
}}>
  <button
    onClick={() => handlePageChange(1)}
    disabled={page === 1}
    className="page-btn"
  >&laquo;</button>
  <button
    onClick={() => handlePageChange(page - 1)}
    disabled={page === 1}
    className="page-btn"
  >&lt;</button>
  {Array.from({ length: totalPages }, (_, i) => {
    const pageNum = i + 1;
    if (
      pageNum === 1 ||
      pageNum === totalPages ||
      Math.abs(page - pageNum) <= 1
    ) {
      return (
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
          className={`page-btn${page === pageNum ? ' active' : ''}`}
        >
          {pageNum}
        </button>
      );
    } else if (
      (pageNum === 2 && page > 3) ||
      (pageNum === totalPages - 1 && page < totalPages - 2)
    ) {
      return <span key={pageNum} style={{ padding: '0 4px' }}>...</span>;
    }
    return null;
  })}
  <button
    onClick={() => handlePageChange(page + 1)}
    disabled={page === totalPages}
    className="page-btn"
  >&gt;</button>
  <button
    onClick={() => handlePageChange(totalPages)}
    disabled={page === totalPages}
    className="page-btn"
  >&raquo;</button>
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
