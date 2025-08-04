import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css';

const CTCManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ctcHistory, setCtcHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCTC, setSelectedCTC] = useState(null);
  
  // Form state for adding/editing CTC
  const [formData, setFormData] = useState({
    effectiveFrom: '',
    basicSalary: '',
    hra: '',
    allowances: '',
    bonuses: '',
    pfContribution: '',
    gratuity: '',
    totalCTC: ''
  });

  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    if (isHR) {
      loadEmployees();
    } else if (isEmployee) {
      loadEmployeeCTC();
    }
  }, [user]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/employees');
      const data = await response.json();
      setEmployees(data.filter(emp => emp.role === 'EMPLOYEE'));
    } catch (error) {
      console.error('Error loading employees:', error);
      setMessage('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeCTC = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/ctc/employee/${user.id}/history`);
      const data = await response.json();
      if (data.success) {
        setCtcHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading CTC:', error);
      setMessage('Error loading CTC information');
    } finally {
      setLoading(false);
    }
  };

  const loadCTCHistory = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/ctc/employee/${employeeId}/history`);
      const data = await response.json();
      if (data.success) {
        setCtcHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading CTC history:', error);
      setMessage('Error loading CTC history');
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    loadCTCHistory(employee.id);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const handleAddCTC = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setMessage('Please select an employee first');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/ctc/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          ...formData
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('CTC added successfully');
        setShowAddForm(false);
        resetForm();
        loadCTCHistory(selectedEmployee.id);
      } else {
        setMessage(data.message || 'Error adding CTC');
      }
    } catch (error) {
      console.error('Error adding CTC:', error);
      setMessage('Error adding CTC');
    }
  };

  const handleEditCTC = async (e) => {
    e.preventDefault();
    if (!selectedCTC || !selectedEmployee) {
      setMessage('Please select a CTC record to edit');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/ctc/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          ...formData
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('CTC updated successfully');
        setShowEditForm(false);
        resetForm();
        loadCTCHistory(selectedEmployee.id);
      } else {
        setMessage(data.message || 'Error updating CTC');
      }
    } catch (error) {
      console.error('Error updating CTC:', error);
      setMessage('Error updating CTC');
    }
  };

  const handleEditClick = (ctc) => {
    setSelectedCTC(ctc);
    setFormData({
      effectiveFrom: ctc.effectiveFrom,
      basicSalary: ctc.basicSalary.toString(),
      hra: ctc.hra.toString(),
      allowances: ctc.allowances.toString(),
      bonuses: ctc.bonuses.toString(),
      pfContribution: ctc.pfContribution.toString(),
      gratuity: ctc.gratuity.toString(),
      totalCTC: ctc.totalCTC.toString()
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      effectiveFrom: '',
      basicSalary: '',
      hra: '',
      allowances: '',
      bonuses: '',
      pfContribution: '',
      gratuity: '',
      totalCTC: ''
    });
    setSelectedCTC(null);
  };

  const calculateTotalCTC = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const pf = parseFloat(formData.pfContribution) || 0;
    const gratuity = parseFloat(formData.gratuity) || 0;
    
    const total = basic + hra + allowances + bonuses + pf + gratuity;
    setFormData(prev => ({ ...prev, totalCTC: total.toString() }));
  };

  // Calculate total when form data changes
  useEffect(() => {
    if (showAddForm || showEditForm) {
      calculateTotalCTC();
    }
  }, [formData.basicSalary, formData.hra, formData.allowances, formData.bonuses, formData.pfContribution, formData.gratuity, showAddForm, showEditForm]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>CTC Management</h1>
        <p>{isHR ? 'Manage employee CTC and compensation details' : 'View your CTC information'}</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {isHR ? (
        // HR Dashboard
        <div className="ctc-management-grid">
          {/* Employee List */}
          <div className="employee-list-section">
            <h2>Employees</h2>
            <div className="employee-list">
              {employees.map(employee => (
                <div
                  key={employee.id}
                  className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <div className="employee-info">
                    <h3>{employee.name}</h3>
                    <p>{employee.position}</p>
                    <p>{employee.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTC Details */}
          <div className="ctc-details-section">
            {selectedEmployee ? (
              <>
                <div className="ctc-header">
                  <h2>CTC - {selectedEmployee.name}</h2>
                  <div className="ctc-actions">
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                      Add New CTC
                    </button>
                  </div>
                </div>

                {/* CTC History */}
                <div className="ctc-history">
                  <h3>CTC History</h3>
                  {ctcHistory.length > 0 ? (
                    <div className="ctc-grid">
                      {ctcHistory.map((ctc) => (
                        <div key={ctc.ctcId} className="ctc-card">
                          <div className="ctc-header">
                            <h4>Effective: {new Date(ctc.effectiveFrom).toLocaleDateString()}</h4>
                            <span className="ctc-status">Active</span>
                          </div>
                          <div className="ctc-details">
                            <div className="ctc-item">
                              <span>Basic Salary:</span>
                              <span>₹{(ctc.basicSalary || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item">
                              <span>HRA:</span>
                              <span>₹{(ctc.hra || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item">
                              <span>Allowances:</span>
                              <span>₹{(ctc.allowances || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item">
                              <span>Bonuses:</span>
                              <span>₹{(ctc.bonuses || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item">
                              <span>PF:</span>
                              <span>₹{(ctc.pfContribution || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item">
                              <span>Gratuity:</span>
                              <span>₹{(ctc.gratuity || 0).toLocaleString()}</span>
                            </div>
                            <div className="ctc-item total">
                              <span>Total CTC:</span>
                              <span>₹{(ctc.totalCTC || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="ctc-actions">
                            <button 
                              className="btn btn-small btn-secondary"
                              onClick={() => handleEditClick(ctc)}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No CTC records found for this employee.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <h2>Select an Employee</h2>
                <p>Choose an employee from the list to view and manage their CTC.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Employee Dashboard
        <div className="employee-ctc-section">
          <h2>Your CTC Information</h2>
          {ctcHistory.length > 0 ? (
            <div className="ctc-summary">
              <div className="current-ctc">
                <h3>Current CTC (Effective: {new Date(ctcHistory[0].effectiveFrom).toLocaleDateString()})</h3>
                <div className="ctc-breakdown">
                  <div className="ctc-item">
                    <span>Basic Salary:</span>
                    <span>₹{(ctcHistory[0].basicSalary || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item">
                    <span>HRA:</span>
                    <span>₹{(ctcHistory[0].hra || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item">
                    <span>Allowances:</span>
                    <span>₹{(ctcHistory[0].allowances || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item">
                    <span>Bonuses:</span>
                    <span>₹{(ctcHistory[0].bonuses || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item">
                    <span>PF Contribution:</span>
                    <span>₹{(ctcHistory[0].pfContribution || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item">
                    <span>Gratuity:</span>
                    <span>₹{(ctcHistory[0].gratuity || 0).toLocaleString()}</span>
                  </div>
                  <div className="ctc-item total">
                    <span>Total CTC:</span>
                    <span>₹{(ctcHistory[0].totalCTC || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {ctcHistory.length > 1 && (
                <div className="ctc-history">
                  <h3>CTC History</h3>
                  <div className="history-list">
                    {ctcHistory.slice(1).map((ctc) => (
                      <div key={ctc.ctcId} className="history-item">
                        <div className="history-date">
                          {new Date(ctc.effectiveFrom).toLocaleDateString()}
                        </div>
                        <div className="history-amount">
                          ₹{(ctc.totalCTC || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No CTC information available.</p>
          )}
        </div>
      )}

      {/* Add CTC Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New CTC</h3>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddCTC} className="ctc-form">
              <div className="form-group">
                <label>Effective From:</label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Basic Salary:</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basicSalary: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>HRA:</label>
                <input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => setFormData(prev => ({ ...prev, hra: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Allowances:</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bonuses:</label>
                <input
                  type="number"
                  value={formData.bonuses}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonuses: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>PF Contribution:</label>
                <input
                  type="number"
                  value={formData.pfContribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, pfContribution: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gratuity:</label>
                <input
                  type="number"
                  value={formData.gratuity}
                  onChange={(e) => setFormData(prev => ({ ...prev, gratuity: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total CTC:</label>
                <input
                  type="number"
                  value={formData.totalCTC}
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add CTC</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CTC Form */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit CTC</h3>
              <button className="close-btn" onClick={() => setShowEditForm(false)}>×</button>
            </div>
            <form onSubmit={handleEditCTC} className="ctc-form">
              <div className="form-group">
                <label>Effective From:</label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Basic Salary:</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basicSalary: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>HRA:</label>
                <input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => setFormData(prev => ({ ...prev, hra: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Allowances:</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bonuses:</label>
                <input
                  type="number"
                  value={formData.bonuses}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonuses: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>PF Contribution:</label>
                <input
                  type="number"
                  value={formData.pfContribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, pfContribution: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gratuity:</label>
                <input
                  type="number"
                  value={formData.gratuity}
                  onChange={(e) => setFormData(prev => ({ ...prev, gratuity: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total CTC:</label>
                <input
                  type="number"
                  value={formData.totalCTC}
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Update CTC</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTCManagement; 