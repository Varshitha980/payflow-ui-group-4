import React, { useState, useEffect } from 'react';
import API from '../api';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    teamSize: 0,
    activeProjects: 0,
    completedTasks: 0,
    teamPerformance: 0
  });
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    phone: '',
    address: ''
  });
  const [education, setEducation] = useState({
    degree: '',
    university: '',
    year: '',
    grade: ''
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    deadline: '',
    priority: 'Medium'
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
        teamSize: data.length,
        activeProjects: stats.activeProjects,
        completedTasks: stats.completedTasks,
        teamPerformance: stats.teamPerformance
      });
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const payload = { ...personal, education: { ...education } };
      const res = await fetch('http://localhost:8080/api/employees/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPersonal({ name: '', email: '', department: '', position: '', startDate: '', phone: '', address: '' });
        setEducation({ degree: '', university: '', year: '', grade: '' });
        setShowAddEmployee(false);
        setStep(1);
        loadEmployees();
      } else {
        alert('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const getTeamPerformance = () => {
    return [
      { metric: 'Task Completion', value: '92%', trend: 'up' },
      { metric: 'Code Quality', value: '88%', trend: 'up' },
      { metric: 'Team Collaboration', value: '95%', trend: 'stable' },
      { metric: 'Meeting Attendance', value: '98%', trend: 'up' }
    ];
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p className="dashboard-subtitle">Lead your team to success with comprehensive project management</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card clickable">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.teamSize}</h3>
            <p>Team Size</p>
            <small>Active members</small>
          </div>
        </div>
        <div className="stat-card clickable">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.activeProjects}</h3>
            <p>Active Projects</p>
            <small>In progress</small>
          </div>
        </div>
        <div className="stat-card clickable">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
            <small>This month</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.teamPerformance}%</h3>
            <p>Team Performance</p>
            <small>Overall score</small>
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="content-left">
          <div className="section-card">
            <div className="section-header">
              <h2>My Team</h2>
              <div className="section-actions">
                <input 
                  type="text" 
                  placeholder="Search team members..." 
                  className="search-input"
                />
                <button className="btn-primary" onClick={() => setShowAddEmployee(true)}>
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
                    <th>Position</th>
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
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>
                        <span className={`status-badge ${employee.status ? employee.status.toLowerCase() : ''}`}>
                          {employee.status || 'Active'}
                        </span>
                      </td>
                      <td>{employee.startDate ? new Date(employee.startDate).toLocaleDateString() : ''}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-secondary small">View</button>
                          <button className="btn-secondary small">Review</button>
                          <button className="btn-secondary small">Message</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Project Management section remains unchanged */}
        </div>
        <div className="content-right">
          <div className="section-card">
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions-list">
              <button className="quick-action-btn" onClick={() => setShowAddEmployee(true)}>
                <span>➕</span>
                <span>Add Employee</span>
              </button>
              <button className="quick-action-btn">
                <span>📋</span>
                <span>New Project</span>
              </button>
              <button className="quick-action-btn">
                <span>📅</span>
                <span>Schedule Meeting</span>
              </button>
              <button className="quick-action-btn">
                <span>📊</span>
                <span>Performance Review</span>
              </button>
              <button className="quick-action-btn">
                <span>📧</span>
                <span>Team Announcement</span>
              </button>
            </div>
          </div>
          {/* Other right-side cards remain unchanged */}
        </div>
      </div>
      {showAddEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button 
                className="modal-close"
                onClick={() => { setShowAddEmployee(false); setStep(1); }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={personal.name}
                      onChange={e => setPersonal({ ...personal, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={personal.email}
                      onChange={e => setPersonal({ ...personal, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={personal.phone}
                      onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={personal.address}
                      onChange={e => setPersonal({ ...personal, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={personal.department}
                      onChange={e => setPersonal({ ...personal, department: e.target.value })}
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
                      value={personal.position}
                      onChange={e => setPersonal({ ...personal, position: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={personal.startDate}
                      onChange={e => setPersonal({ ...personal, startDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      placeholder="Enter degree"
                      value={education.degree}
                      onChange={e => setEducation({ ...education, degree: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>University</label>
                    <input
                      type="text"
                      placeholder="Enter university"
                      value={education.university}
                      onChange={e => setEducation({ ...education, university: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      placeholder="Enter year of graduation"
                      value={education.year}
                      onChange={e => setEducation({ ...education, year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="text"
                      placeholder="Enter grade/percentage"
                      value={education.grade}
                      onChange={e => setEducation({ ...education, grade: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {step === 2 && (
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              )}
              {step === 1 && (
                <button className="btn-primary" onClick={() => setStep(2)}>Next</button>
              )}
              {step === 2 && (
                <button className="btn-primary" onClick={handleAddEmployee}>Add Employee</button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* New Project Modal and other modals remain unchanged */}
    </div>
  );
};

export default ManagerDashboard; 