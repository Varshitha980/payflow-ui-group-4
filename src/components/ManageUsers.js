import React, { useState, useEffect } from 'react';
import API from '../api';
import './ModernDashboardStyles.css';

const USERS_PER_PAGE = 10;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'HR' });
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch('http://localhost:8081/api/users');
      const usersData = await usersRes.json();
      const nonAdminUsers = usersData.filter(u => u.role !== 'ADMIN');
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
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
      await fetch(`http://localhost:8081/api/users/${userId}/status`, {
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
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manage Users</h1>
        <p className="dashboard-subtitle">HR & Manager Management</p>
      </div>

      {msg && (
        <div className="alert alert-success">
          {msg}
          <button onClick={() => setMsg('')} className="alert-close">×</button>
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <h2>User Management</h2>
          <div className="table-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
              style={{ padding: '10px 20px', fontSize: '1rem' }}
            >
              ➕ Create User
            </button>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    <h3>No users found</h3>
                    <p>Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-badge ${user.status ? user.status.toLowerCase() : 'active'}`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className={`btn-${user.status === 'Active' ? 'danger' : 'success'} small`}
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              ‹
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
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

export default ManageUsers; 