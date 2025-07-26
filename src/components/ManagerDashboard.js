import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [experiences, setExperiences] = useState([
    { company: '', role: '', years: '', description: '' }
  ]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 10;
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leavePage, setLeavePage] = useState(1);
  const LEAVES_PER_PAGE = 10;
  const location = useLocation();

  useEffect(() => {
    loadEmployees();
    if (location.pathname === '/manager/leaves') {
      fetchLeaveRequests();
    }
  }, [location.pathname]);

  const loadEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/employees');
      const data = await res.json();
      console.log('Fetched employees:', data);
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
      const payload = { ...personal, leaves: 12, experiences, education: { ...education } };
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

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/leaves');
      const data = await res.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setLeaveRequests([]);
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

  // Filter employees by name or email (case-insensitive)
  const filteredEmployees = employees.filter(emp =>
    (emp.name && emp.name.toLowerCase().includes(search.toLowerCase())) ||
    (emp.email && emp.email.toLowerCase().includes(search.toLowerCase()))
  );
  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * EMPLOYEES_PER_PAGE, page * EMPLOYEES_PER_PAGE);

  const totalLeavePages = Math.ceil(leaveRequests.length / LEAVES_PER_PAGE) || 1;
  const paginatedLeaves = leaveRequests.slice((leavePage - 1) * LEAVES_PER_PAGE, leavePage * LEAVES_PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 0', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="dashboard-header" style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>Manager Dashboard</h1>
          <p style={{ color: '#6c757d', marginTop: 8 }}>Lead your team to success with comprehensive project management</p>
        </div>
        {location.pathname === '/manager' && (
          <>
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
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                          <th>Status</th>
                          <th>Start Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployees.map(employee => (
                          <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
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
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, fontSize: '16px', width: '100%' }}>
                        <button style={{ fontSize: '12px', padding: '2px 8px', minWidth: 0 }} onClick={() => setPage(prev => Math.max(1, prev - 1))}>&lt;</button>
                        <span style={{ margin: '0 10px', fontSize: '14px' }}>Page {page} of {totalPages}</span>
                        <button style={{ fontSize: '12px', padding: '2px 8px', minWidth: 0 }} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}>&gt;</button>
                      </div>
                    )}
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
                <div className="modal" style={{ maxWidth: 900 }}>
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
                        <div className="form-group">
                          <label>Past Experience</label>
                          {experiences.map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: 10, border: '1px solid #eee', borderRadius: 8, padding: 10 }}>
                              <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={e => {
                                  const arr = [...experiences];
                                  arr[idx].company = e.target.value;
                                  setExperiences(arr);
                                }}
                                style={{ marginRight: 8 }}
                              />
                              <input
                                type="text"
                                placeholder="Role/Designation"
                                value={exp.role}
                                onChange={e => {
                                  const arr = [...experiences];
                                  arr[idx].role = e.target.value;
                                  setExperiences(arr);
                                }}
                                style={{ marginRight: 8 }}
                              />
                              <input
                                type="text"
                                placeholder="Years"
                                value={exp.years}
                                onChange={e => {
                                  const arr = [...experiences];
                                  arr[idx].years = e.target.value;
                                  setExperiences(arr);
                                }}
                                style={{ marginRight: 8, width: 80 }}
                              />
                              <input
                                type="text"
                                placeholder="Description"
                                value={exp.description}
                                onChange={e => {
                                  const arr = [...experiences];
                                  arr[idx].description = e.target.value;
                                  setExperiences(arr);
                                }}
                                style={{ marginRight: 8 }}
                              />
                              {experiences.length > 1 && (
                                <button type="button" style={{ fontSize: 18, color: 'red', marginLeft: 4 }} onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}>–</button>
                              )}
                            </div>
                          ))}
                          <button type="button" style={{ fontSize: 22, marginTop: 4 }} onClick={() => setExperiences([...experiences, { company: '', role: '', years: '', description: '' }])}>+ Add Experience</button>
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
          </>
        )}
        {location.pathname === '/manager/leaves' && (
          <div className="section-card" style={{ width: '100%', margin: '0 auto', boxShadow: '0 4px 24px rgba(44,62,80,0.07)', borderRadius: 16, padding: 32, background: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Leave Requests</h2>
            <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '20px', margin: '0 auto' }}>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No leave requests found.</td></tr>
                  ) : (
                    paginatedLeaves.map(lr => (
                      <tr key={lr.id}>
                        <td>{lr.employeeId}</td>
                        <td>{lr.startDate}</td>
                        <td>{lr.endDate}</td>
                        <td>{lr.reason}</td>
                        <td>
                          <span className={`status-badge ${lr.status ? lr.status.toLowerCase() : ''}`}>{lr.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalLeavePages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, fontSize: '14px', width: '100%' }}>
                <button onClick={() => setLeavePage(prev => Math.max(1, prev - 1))} style={{ fontSize: '12px', padding: '2px 8px', width: '2.5cm' }}>&lt;</button>
                <span style={{ margin: '0 10px' }}>Page {leavePage} of {totalLeavePages}</span>
                <button onClick={() => setLeavePage(prev => Math.min(totalLeavePages, prev + 1))} style={{ fontSize: '12px', padding: '2px 8px', width: '2.5cm' }}>&gt;</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard; 