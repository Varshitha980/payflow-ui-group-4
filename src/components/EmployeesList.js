import React, { useState, useEffect } from 'react';

const EMPLOYEES_PER_PAGE = 20;

const EmployeesList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/employees');
      const data = await res.json();
      console.log('Fetched users:', data);
      // Only show HR and MANAGER
      const filtered = data.filter(u => u.role === 'HR' || u.role === 'MANAGER');
      setUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Filter by search
  const filteredUsers = users.filter(user =>
    user.name && user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / EMPLOYEES_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * EMPLOYEES_PER_PAGE, page * EMPLOYEES_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HRs & Managers List</h1>
        <p className="dashboard-subtitle">All HRs and Managers</p>
      </div>
      <div className="table-section">
        <div className="table-header">
          <h2>User Directory</h2>
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
        <div className="table-container" style={{ maxHeight: 600, overflowY: 'auto' }}>
          <table className="data-table" style={{ fontSize: '22px' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No HRs or Managers found.</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role ? user.role.toLowerCase() : ''}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status ? user.status.toLowerCase() : ''}`}>{user.status || 'Active'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, fontSize: '14px', width: '100%' }}>
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} style={{ marginRight: 10, fontSize: '12px', padding: '2px 8px', minWidth: 0, width: '2.5cm' }}>&lt; Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              style={{
                margin: '0 4px',
                fontWeight: page === i + 1 ? 'bold' : 'normal',
                background: page === i + 1 ? '#007bff' : '#f8f9fa',
                color: page === i + 1 ? 'white' : '#333',
                borderRadius: 6,
                border: '1px solid #ccc',
                padding: '2px 8px',
                cursor: 'pointer',
                width: '2.5cm'
              }}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} style={{ marginLeft: 10, fontSize: '12px', padding: '2px 8px', minWidth: 0, width: '2.5cm' }}>Next &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeesList; 