import React, { useState, useEffect } from 'react';
import API from '../api';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newThisMonth: 0,
    pendingProfiles: 0
  });
  const [employees, setEmployees] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/employees');
      const data = await res.json();
      setEmployees(data);
      setStats({
        totalEmployees: data.length,
        newThisMonth: data.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).length,
        pendingProfiles: data.filter(e => e.status === 'Pending').length
      });
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/employees/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', email: '', department: '', position: '', startDate: '' });
        setShowAddEmployee(false);
        loadEmployees();
      } else {
        alert('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const getUpcomingEvents = () => {
    return employees.slice(0, 3).map(e => ({ type: 'Onboarding', name: e.name, date: e.startDate }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HR Dashboard</h1>
        <p className="dashboard-subtitle">Efficient control center for managing employees and onboarding</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card clickable">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Total Employees</p>
            <small>Click to view list</small>
          </div>
        </div>
        <div className="stat-card clickable">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{stats.newThisMonth}</h3>
            <p>New This Month</p>
            <small>Onboarded</small>
          </div>
        </div>
        <div className="stat-card clickable">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingProfiles}</h3>
            <p>Pending Profiles</p>
            <small>Incomplete</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>95%</h3>
            <p>Completion Rate</p>
            <small>This month</small>
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="content-left">
          <div className="section-card">
            <div className="section-header">
              <h2>Employee Management</h2>
              <div className="section-actions">
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  className="search-input"
                />
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddEmployee(true)}
                >
                  ➕ Add Employee
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>
                        <span className="department-badge">
                          {employee.department}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${employee.status ? employee.status.toLowerCase() : ''}`}>
                          {employee.status || 'Active'}
                        </span>
                      </td>
                      <td>{employee.startDate ? new Date(employee.startDate).toLocaleDateString() : ''}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-secondary small">View</button>
                          <button className="btn-secondary small">Reset</button>
                          <button className="btn-secondary small">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="content-right">
          <div className="section-card">
            <h3>📅 Upcoming Events</h3>
            <div className="events-list">
              {getUpcomingEvents().map((event, index) => (
                <div key={index} className="event-item">
                  <div className="event-icon">🆕</div>
                  <div className="event-details">
                    <div className="event-title">{event.name}</div>
                    <div className="event-type">{event.type}</div>
                    <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section-card">
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions-list">
              <button className="quick-action-btn" onClick={() => setShowAddEmployee(true)}>
                <span>➕</span>
                <span>Add New Employee</span>
              </button>
              <button className="quick-action-btn">
                <span>📥</span>
                <span>Import Bulk Employees (CSV)</span>
              </button>
              <button className="quick-action-btn">
                <span>👤</span>
                <span>Add New HR/Manager</span>
              </button>
              <button className="quick-action-btn">
                <span>📧</span>
                <span>Send Reminders</span>
              </button>
            </div>
          </div>
          <div className="section-card">
            <h3>🔁 Recent Activity</h3>
            <div className="activity-list">
              {/* ... */}
            </div>
          </div>
        </div>
      </div>
      {showAddEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddEmployee(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  placeholder="Enter position"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddEmployee(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddEmployee}
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard; 