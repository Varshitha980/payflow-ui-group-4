import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './ModernDashboardStyles.css';

const HRDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newThisMonth: 0,
    pendingProfiles: 0,
    unassignedEmployees: 0
  });
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showManagerAssignment, setShowManagerAssignment] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
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
  const [experiences, setExperiences] = useState([
    { company: '', role: '', years: '', description: '' }
  ]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 10;
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load employees
      const employeesRes = await fetch('http://localhost:8081/api/employees');
      const employeesData = await employeesRes.json();
      setEmployees(employeesData);

      // Load managers
      const managersRes = await fetch('http://localhost:8081/api/users/managers');
      const managersData = await managersRes.json();
      setManagers(managersData);

      // Load unassigned employees
      const unassignedRes = await fetch('http://localhost:8081/api/employees/unassigned');
      const unassignedData = await unassignedRes.json();
      setUnassignedEmployees(unassignedData);

      // Calculate stats from backend data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      setStats({
        totalEmployees: employeesData.length,
        newThisMonth: employeesData.filter(e => {
          if (!e.startDate) return false;
          const startDate = new Date(e.startDate);
          return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
        }).length,
        pendingProfiles: employeesData.filter(e => e.status === 'Pending').length,
        unassignedEmployees: unassignedData.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const payload = { 
        ...personal, 
        leaves: 12, 
        experiences, 
        education: { ...education }
      };
      
      const res = await fetch('http://localhost:8081/api/employees/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setPersonal({ name: '', email: '', department: '', position: '', startDate: '', phone: '', address: '' });
        setEducation({ degree: '', university: '', year: '', grade: '' });
        setExperiences([{ company: '', role: '', years: '', description: '' }]);
        setShowAddEmployee(false);
        setStep(1);
        setMsg('Employee added successfully!');
        loadDashboardData();
      } else {
        setMsg('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setMsg('Error adding employee');
    }
  };

  const handleAssignManager = async () => {
    if (!selectedEmployee || !selectedManager) {
      setMsg('Please select both employee and manager');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/api/employees/${selectedEmployee.id}/assign-manager/${selectedManager}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setMsg('Manager assigned successfully!');
        setShowManagerAssignment(false);
        setSelectedEmployee(null);
        setSelectedManager('');
        loadDashboardData();
      } else {
        setMsg('Failed to assign manager');
      }
    } catch (error) {
      console.error('Error assigning manager:', error);
      setMsg('Error assigning manager');
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', years: '', description: '' }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const nextStep = () => {
    if (step === 1 && (!personal.name || !personal.email || !personal.department || !personal.position)) {
      setMsg('Please fill in all required fields');
      return;
    }
    setStep(step + 1);
    setMsg('');
  };

  const prevStep = () => {
    setStep(step - 1);
    setMsg('');
  };

  // Filter employees by search string
  const filteredEmployees = employees.filter(emp =>
    emp.name && emp.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * EMPLOYEES_PER_PAGE, page * EMPLOYEES_PER_PAGE);

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
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome {user?.username || 'HR'}</h1>
        <p className="dashboard-subtitle">Manage your workforce efficiently</p>
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
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{stats.newThisMonth}</h3>
            <p>New This Month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingProfiles}</h3>
            <p>Pending Profiles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <h3>{stats.unassignedEmployees}</h3>
            <p>Unassigned</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn primary"
            onClick={() => setShowAddEmployee(true)}
          >
            <span>➕</span>
            <span>Add Employee</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setShowManagerAssignment(true)}
          >
            <span>👨‍💼</span>
            <span>Assign Managers</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate('/hr/summary')}
          >
            <span>📈</span>
            <span>Summary</span>
          </button>
        </div>
      </div>

      {/* Employee Management Table */}
      <div className="table-section">
        <div className="table-header">
          <h2>Employee Management</h2>
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search employees..." 
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
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    <h3>No employees found</h3>
                    <p>Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={`status-badge ${emp.status ? emp.status.toLowerCase() : 'active'}`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td>{emp.managerId ? `Manager ${emp.managerId}` : 'Unassigned'}</td>
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

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Employee - Step {step} of 3</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddEmployee(false);
                  setStep(1);
                  setPersonal({ name: '', email: '', department: '', position: '', startDate: '', phone: '', address: '' });
                  setEducation({ degree: '', university: '', year: '', grade: '' });
                  setExperiences([{ company: '', role: '', years: '', description: '' }]);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={personal.name}
                      onChange={e => setPersonal({ ...personal, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={personal.email}
                      onChange={e => setPersonal({ ...personal, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input
                      type="text"
                      value={personal.department}
                      onChange={e => setPersonal({ ...personal, department: e.target.value })}
                      placeholder="Enter department"
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      value={personal.position}
                      onChange={e => setPersonal({ ...personal, position: e.target.value })}
                      placeholder="Enter position"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={personal.startDate}
                      onChange={e => setPersonal({ ...personal, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={personal.phone}
                      onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      value={personal.address}
                      onChange={e => setPersonal({ ...personal, address: e.target.value })}
                      placeholder="Enter address"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={e => setEducation({ ...education, degree: e.target.value })}
                      placeholder="Enter degree"
                    />
                  </div>
                  <div className="form-group">
                    <label>University</label>
                    <input
                      type="text"
                      value={education.university}
                      onChange={e => setEducation({ ...education, university: e.target.value })}
                      placeholder="Enter university"
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <input
                      type="text"
                      value={education.year}
                      onChange={e => setEducation({ ...education, year: e.target.value })}
                      placeholder="Enter graduation year"
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="text"
                      value={education.grade}
                      onChange={e => setEducation({ ...education, grade: e.target.value })}
                      placeholder="Enter grade"
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h4>Work Experience</h4>
                  {experiences.map((exp, index) => (
                    <div key={index} style={{ border: '1px solid #e1e8ed', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h5>Experience {index + 1}</h5>
                        {experiences.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeExperience(index)}
                            style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => updateExperience(index, 'company', e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={e => updateExperience(index, 'role', e.target.value)}
                          placeholder="Enter role"
                        />
                      </div>
                      <div className="form-group">
                        <label>Years</label>
                        <input
                          type="text"
                          value={exp.years}
                          onChange={e => updateExperience(index, 'years', e.target.value)}
                          placeholder="Enter years of experience"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={exp.description}
                          onChange={e => updateExperience(index, 'description', e.target.value)}
                          placeholder="Enter job description"
                          rows="3"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addExperience}
                    style={{ background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
                  >
                    + Add Experience
                  </button>
                </>
              )}
            </div>
            <div className="modal-footer">
              {step > 1 && (
                <button className="btn-secondary" onClick={prevStep}>
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button className="btn-primary" onClick={nextStep}>
                  Next
                </button>
              ) : (
                <button className="btn-success" onClick={handleAddEmployee}>
                  Add Employee
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manager Assignment Modal */}
      {showManagerAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Manager to Employee</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowManagerAssignment(false);
                  setSelectedEmployee(null);
                  setSelectedManager('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee</label>
                <select
                  value={selectedEmployee ? selectedEmployee.id : ''}
                  onChange={e => {
                    const emp = unassignedEmployees.find(emp => emp.id == e.target.value);
                    setSelectedEmployee(emp);
                  }}
                >
                  <option value="">-- Select Employee --</option>
                  {unassignedEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Manager</label>
                <select
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowManagerAssignment(false);
                setSelectedEmployee(null);
                setSelectedManager('');
              }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAssignManager}>
                Assign Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard; 