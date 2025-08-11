import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const EMPLOYEES_PER_PAGE = 10;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const employeesRes = await fetch('http://localhost:8081/api/employees');
      const employeesData = await employeesRes.json();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees by search string (case-insensitive)
  const filteredEmployees = employees.filter(emp =>
    emp.name && emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email && emp.email.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * EMPLOYEES_PER_PAGE, page * EMPLOYEES_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>All Employees</h1>
        <p className="dashboard-subtitle">Complete employee directory</p>
      </div>

      {/* Employee List Table */}
      <div className="table-section">
        <div className="table-header">
          <h2>Employee Directory</h2>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
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
                    <td>
                      <button 
                        className="btn-primary small"
                        onClick={() => handleSeeDetails(emp)}
                      >
                        See Details
                      </button>
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

      {/* Employee Details Modal */}
      {showDetails && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedEmployee(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="employee-details">
                <div className="detail-group">
                  <h4>Personal Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedEmployee.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedEmployee.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedEmployee.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedEmployee.address || 'Not provided'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Work Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">{selectedEmployee.position || 'Not assigned'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{selectedEmployee.department || 'Not assigned'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{selectedEmployee.startDate || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Manager:</span>
                    <span className="detail-value">{selectedEmployee.managerId ? `Manager ${selectedEmployee.managerId}` : 'Unassigned'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge ${selectedEmployee.status ? selectedEmployee.status.toLowerCase() : 'active'}`}>
                        {selectedEmployee.status || 'Active'}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Leave Balance:</span>
                    <span className="detail-value">{selectedEmployee.leaves || 0} days</span>
                  </div>
                </div>

                {(() => {
                  try {
                    const education = selectedEmployee.education ? JSON.parse(selectedEmployee.education) : null;
                    if (education && (education.degree || education.university || education.year || education.grade)) {
                      return (
                        <div className="detail-group">
                          <h4>Education</h4>
                          <div className="detail-row">
                            <span className="detail-label">Degree:</span>
                            <span className="detail-value">{education.degree || 'Not provided'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">University:</span>
                            <span className="detail-value">{education.university || 'Not provided'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Year:</span>
                            <span className="detail-value">{education.year || 'Not provided'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Grade:</span>
                            <span className="detail-value">{education.grade || 'Not provided'}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  } catch (error) {
                    console.warn('Error parsing education:', error);
                    return null;
                  }
                })()}

                {(() => {
                  try {
                    const experiences = selectedEmployee.experiences ? JSON.parse(selectedEmployee.experiences) : [];
                    if (experiences && experiences.length > 0) {
                      return (
                        <div className="detail-group">
                          <h4>Experience</h4>
                          {experiences.map((exp, index) => (
                            <div key={index} className="experience-item">
                              <div className="detail-row">
                                <span className="detail-label">Company:</span>
                                <span className="detail-value">{exp.company || 'Not provided'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Role:</span>
                                <span className="detail-value">{exp.role || 'Not provided'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Years:</span>
                                <span className="detail-value">{exp.years || 'Not provided'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Description:</span>
                                <span className="detail-value">{exp.description || 'Not provided'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  } catch (error) {
                    console.warn('Error parsing experiences:', error);
                    return null;
                  }
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowDetails(false);
                  setSelectedEmployee(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 