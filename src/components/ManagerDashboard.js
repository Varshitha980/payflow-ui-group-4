import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api';
import './ModernDashboardStyles.css';

const ManagerDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    teamSize: 0,
    activeProjects: 0,
    completedTasks: 0,
    teamPerformance: 0
  });
  const [employees, setEmployees] = useState([]);
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
  
  const [ctcDetails, setCtcDetails] = useState({
    basicSalary: '',
    hra: '',
    allowances: '',
    bonuses: '',
    pfContribution: '',
    gratuity: ''
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
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leavePage, setLeavePage] = useState(1);
  const LEAVES_PER_PAGE = 10;
  const [processingLeave, setProcessingLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const location = useLocation();

  useEffect(() => {
    loadDashboardData();
  }, [location.pathname, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load employees assigned to this manager first
      const endpoint = user && user.id ? `http://localhost:8081/api/employees/manager/${user.id}` : 'http://localhost:8081/api/employees';
      const employeesRes = await fetch(endpoint);
      const employeesData = await employeesRes.json();
      setEmployees(employeesData);

      console.log('Manager ID:', user?.id);
      console.log('Employees loaded:', employeesData);

      // Calculate stats from backend data
      setStats({
        teamSize: employeesData.length,
        activeProjects: 0, // This would come from a backend endpoint if available
        completedTasks: 0, // This would come from a backend endpoint if available
        teamPerformance: 0 // This would come from a backend endpoint if available
      });

      // Load leave requests for this manager's team after employees are loaded
      // Always load leave requests, not just when on /manager/leaves route
      let leaveEndpoint = user && user.id ? `http://localhost:8081/api/leaves/manager/${user.id}` : 'http://localhost:8081/api/leaves';
      console.log('Leave endpoint:', leaveEndpoint);
      console.log('Manager ID:', user?.id);
      console.log('Manager employees:', employeesData);
      
      let leaveRes = await fetch(leaveEndpoint);
      let leaveData = await leaveRes.json();
      
      console.log('Raw leave data:', leaveData);
      
      // If no leave data found with manager-specific endpoint, try loading all leaves and filter
      if (!Array.isArray(leaveData) || leaveData.length === 0) {
        console.log('No leave data from manager endpoint, trying all leaves...');
        leaveEndpoint = 'http://localhost:8081/api/leaves';
        leaveRes = await fetch(leaveEndpoint);
        leaveData = await leaveRes.json();
        console.log('All leaves data:', leaveData);
        
        // Filter leaves for this manager's employees
        if (Array.isArray(leaveData) && employeesData.length > 0) {
          const employeeEmails = employeesData.map(emp => emp.email);
          const employeeIds = employeesData.map(emp => emp.id);
          leaveData = leaveData.filter(leave => 
            employeeEmails.includes(leave.employeeEmail) || 
            (leave.employeeId && employeeIds.includes(leave.employeeId))
          );
          console.log('Filtered leaves for manager employees:', leaveData);
        }
      }
      
      // Enhance leave requests with employee names
      const enhancedLeaveData = Array.isArray(leaveData) ? leaveData.map(leave => {
        // Try to match by email first, then by employee ID
        let employee = employeesData.find(emp => emp.email === leave.employeeEmail);
        if (!employee && leave.employeeId) {
          employee = employeesData.find(emp => emp.id === leave.employeeId);
        }
        console.log('Matching employee for leave', leave.id, 'email:', leave.employeeEmail, 'employeeId:', leave.employeeId, 'found:', employee);
        return {
          ...leave,
          employeeName: employee ? employee.name : (leave.employeeEmail ? leave.employeeEmail.split('@')[0] : 'Unknown')
        };
      }) : [];
      
      console.log('Enhanced leave data:', enhancedLeaveData);
      setLeaveRequests(enhancedLeaveData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      // Calculate total CTC
      const totalCtc = (
        parseFloat(ctcDetails.basicSalary || 0) +
        parseFloat(ctcDetails.hra || 0) +
        parseFloat(ctcDetails.allowances || 0) +
        parseFloat(ctcDetails.bonuses || 0) +
        parseFloat(ctcDetails.pfContribution || 0) +
        parseFloat(ctcDetails.gratuity || 0)
      );

      const payload = { 
        ...personal, 
        leaves: 12, 
        experiences, 
        education: { ...education },
        ...ctcDetails,
        totalCtc: totalCtc.toString(),
        // Add manager ID if user is provided
        ...(user && user.id && { managerId: user.id })
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
        setCtcDetails({
          basicSalary: '',
          hra: '',
          allowances: '',
          bonuses: '',
          pfContribution: '',
          gratuity: ''
        });
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

  const handleLeaveAction = async (leaveId, status) => {
    setProcessingLeave(leaveId);
    try {
      const res = await fetch(`http://localhost:8081/api/leaves/${leaveId}/${status.toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setMsg(`Leave request ${status.toLowerCase()} successfully!`);
        loadDashboardData();
      } else {
        setMsg(`Failed to ${status.toLowerCase()} leave request`);
      }
    } catch (error) {
      console.error('Error processing leave:', error);
      setMsg('Error processing leave request');
    } finally {
      setProcessingLeave(null);
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

  // Leave requests pagination
  const totalLeavePages = Math.ceil(leaveRequests.length / LEAVES_PER_PAGE) || 1;
  const paginatedLeaves = leaveRequests.slice((leavePage - 1) * LEAVES_PER_PAGE, leavePage * LEAVES_PER_PAGE);

  const handleLeavePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalLeavePages) {
      setLeavePage(newPage);
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
        <h1>
          {location.pathname === '/manager/team' ? 'My Team' : 
           location.pathname === '/manager/leaves' ? 'Leave Requests' :
           `Welcome ${user?.username || 'Manager'}`}
        </h1>
        <p className="dashboard-subtitle">
          {location.pathname === '/manager/team' ? 'Manage your team members' :
           location.pathname === '/manager/leaves' ? 'Review and approve leave requests' :
           'Lead your team to success'}
        </p>
      </div>

      {msg && (
        <div className="alert alert-success">
          {msg}
          <button onClick={() => setMsg('')} className="alert-close">×</button>
        </div>
      )}

      {(location.pathname === '/manager' || location.pathname === '/manager/team') && (
        <>
          {/* Information Widgets */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.teamSize}</h3>
                <p>Team Size</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{leaveRequests.filter(lr => lr.status === 'PENDING').length}</h3>
                <p>Pending Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{leaveRequests.filter(lr => lr.status === 'APPROVED').length}</h3>
                <p>Approved Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>{leaveRequests.length}</h3>
                <p>Total Requests</p>
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
                onClick={() => window.location.href = '/manager/leaves'}
              >
                <span>📋</span>
                <span>Leave Requests</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/manager/summary'}
              >
                <span>📊</span>
                <span>Team Summary</span>
              </button>
            </div>
          </div>

          {/* Team Management Table */}
          <div className="table-section">
            <div className="table-header">
              <h2>My Team</h2>
              <div className="table-actions">
                <input 
                  type="text" 
                  placeholder="Search team members..." 
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        <h3>No team members found</h3>
                        <p>Add employees to build your team</p>
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
                        <td>
                          <div className="action-buttons">
                            <button className="btn-secondary small">View</button>
                            <button className="btn-primary small">Edit</button>
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
        </>
      )}

      {location.pathname === '/manager/leaves' && (
        <div className="table-section">
          <div className="table-header">
            <h2>Leave Request Management</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      <h3>No leave requests found</h3>
                      <p>Your team has no pending leave requests</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLeaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.employeeName || leave.employeeEmail?.split('@')[0] || 'Unknown'}</td>
                      <td>{leave.employeeEmail}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`status-badge ${leave.status ? leave.status.toLowerCase() : 'pending'}`}>
                          {leave.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {leave.status === 'PENDING' && (
                            <>
                              <button 
                                className="btn-success small"
                                onClick={() => handleLeaveAction(leave.id, 'APPROVE')}
                                disabled={processingLeave === leave.id}
                              >
                                {processingLeave === leave.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button 
                                className="btn-danger small"
                                onClick={() => handleLeaveAction(leave.id, 'REJECT')}
                                disabled={processingLeave === leave.id}
                              >
                                {processingLeave === leave.id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {leave.status !== 'PENDING' && (
                            <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                              {leave.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalLeavePages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handleLeavePageChange(leavePage - 1)}
                disabled={leavePage === 1}
              >
                ‹
              </button>
              <span>Page {leavePage} of {totalLeavePages}</span>
              <button 
                onClick={() => handleLeavePageChange(leavePage + 1)}
                disabled={leavePage === totalLeavePages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

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
                  <h4>CTC Details</h4>
                  <div className="form-group">
                    <label>Basic Salary</label>
                    <input
                      type="number"
                      value={ctcDetails.basicSalary}
                      onChange={e => setCtcDetails({ ...ctcDetails, basicSalary: e.target.value })}
                      placeholder="Enter basic salary"
                    />
                  </div>
                  <div className="form-group">
                    <label>HRA</label>
                    <input
                      type="number"
                      value={ctcDetails.hra}
                      onChange={e => setCtcDetails({ ...ctcDetails, hra: e.target.value })}
                      placeholder="Enter HRA"
                    />
                  </div>
                  <div className="form-group">
                    <label>Allowances</label>
                    <input
                      type="number"
                      value={ctcDetails.allowances}
                      onChange={e => setCtcDetails({ ...ctcDetails, allowances: e.target.value })}
                      placeholder="Enter allowances"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bonuses</label>
                    <input
                      type="number"
                      value={ctcDetails.bonuses}
                      onChange={e => setCtcDetails({ ...ctcDetails, bonuses: e.target.value })}
                      placeholder="Enter bonuses"
                    />
                  </div>
                  <div className="form-group">
                    <label>PF Contribution</label>
                    <input
                      type="number"
                      value={ctcDetails.pfContribution}
                      onChange={e => setCtcDetails({ ...ctcDetails, pfContribution: e.target.value })}
                      placeholder="Enter PF contribution"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gratuity</label>
                    <input
                      type="number"
                      value={ctcDetails.gratuity}
                      onChange={e => setCtcDetails({ ...ctcDetails, gratuity: e.target.value })}
                      placeholder="Enter gratuity"
                    />
                  </div>
                  
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
    </div>
  );
};

export default ManagerDashboard;