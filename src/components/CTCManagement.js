import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css'; // Assuming this CSS file exists

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
    totalCTC: '',
    da: '',
    specialAllowance: ''
  });

  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    if (isHR) {
      loadEmployees();
    } else if (isEmployee) {
      loadEmployeeCTC();
    }
  }, [user]); // Depend on 'user' to re-fetch when user changes

  // Function to load employees for HR/Admin
  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/employees');
      const data = await response.json();
      // Filter for employees with 'EMPLOYEE' role
      setEmployees(data.filter(emp => emp.role === 'EMPLOYEE'));
    } catch (error) {
      console.error('Error loading employees:', error);
      setMessage('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  // Function to load CTC history for the logged-in employee
  const loadEmployeeCTC = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/ctc/employee/${user.id}/history`);
      const data = await response.json();
      if (data.success) {
        // Sort CTC history by effectiveFrom date in descending order
        setCtcHistory(data.data.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom)));
      }
    } catch (error) {
      console.error('Error loading CTC:', error);
      setMessage('Error loading CTC information');
    } finally {
      setLoading(false);
    }
  };

  // Function to load CTC history for a specific employee (used by HR)
  const loadCTCHistory = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/ctc/employee/${employeeId}/history`);
      const data = await response.json();
      if (data.success) {
        // Sort CTC history by effectiveFrom date in descending order
        setCtcHistory(data.data.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom)));
      }
    } catch (error) {
      console.error('Error loading CTC history:', error);
      setMessage('Error loading CTC history');
    }
  };

  // Handler for selecting an employee from the list
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    loadCTCHistory(employee.id);
    setShowAddForm(false); // Close add form if open
    setShowEditForm(false); // Close edit form if open
  };

  // Handler for adding a new CTC record
  const handleAddCTC = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setMessage('Please select an employee first');
      return;
    }

    // Prepare data, converting date string to a Date object or ISO string
    const ctcDataToSend = {
      employeeId: selectedEmployee.id,
      // Explicitly parse numeric fields to numbers
      basicSalary: parseFloat(formData.basicSalary) || 0,
      hra: parseFloat(formData.hra) || 0,
      allowances: parseFloat(formData.allowances) || 0,
      bonuses: parseFloat(formData.bonuses) || 0,
      pfContribution: parseFloat(formData.pfContribution) || 0,
      gratuity: parseFloat(formData.gratuity) || 0,
      totalCTC: parseFloat(formData.totalCTC) || 0,
      da: parseFloat(formData.da) || 0,
      specialAllowance: parseFloat(formData.specialAllowance) || 0,
      // Ensure effectiveFrom is sent in a format the backend expects.
      // Converting to ISO string is a common and safe practice.
      effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString().split('T')[0] : ''
    };

    try {
      // Use PUT method as required by the backend
      const response = await fetch('http://localhost:8081/api/ctc/add', {
        method: 'PUT', // Using PUT as required by the backend endpoint
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctcDataToSend) // Send the prepared data
      });

      const data = await response.json();

      // Check if the HTTP response was successful (status in 200-299 range)
      if (response.ok && data.success) {
        setMessage('CTC added successfully');
        setShowAddForm(false);
        resetForm();
        loadCTCHistory(selectedEmployee.id); // Reload history to show new entry
      } else {
        setMessage(data.message || 'Error adding CTC');
      }
    } catch (error) {
      console.error('Error adding CTC:', error);
      setMessage('Error adding CTC');
    }
  };

  // Handler for editing an existing CTC record
  const handleEditCTC = async (e) => {
    e.preventDefault();
    if (!selectedCTC || !selectedEmployee) {
      setMessage('Please select a CTC record to edit');
      return;
    }

    // Prepare data for update, including the ctcId for identification
    const ctcDataToUpdate = {
      ctcId: selectedCTC.ctcId, // Ensure the CTC ID is sent for update
      employeeId: selectedEmployee.id,
      // Explicitly parse numeric fields to numbers
      basicSalary: parseFloat(formData.basicSalary) || 0,
      hra: parseFloat(formData.hra) || 0,
      allowances: parseFloat(formData.allowances) || 0,
      bonuses: parseFloat(formData.bonuses) || 0,
      pfContribution: parseFloat(formData.pfContribution) || 0,
      gratuity: parseFloat(formData.gratuity) || 0,
      totalCTC: parseFloat(formData.totalCTC) || 0,
      da: parseFloat(formData.da) || 0,
      specialAllowance: parseFloat(formData.specialAllowance) || 0,
      effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString().split('T')[0] : ''
    };

    try {
      const response = await fetch('http://localhost:8081/api/ctc/update', {
        method: 'PUT', // This is correct for updating
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctcDataToUpdate) // Send the prepared data for update
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('CTC updated successfully');
        setShowEditForm(false);
        resetForm();
        loadCTCHistory(selectedEmployee.id); // Reload history to show updated entry
      } else {
        setMessage(data.message || 'Error updating CTC');
      }
    } catch (error) {
      console.error('Error updating CTC:', error);
      setMessage('Error updating CTC');
    }
  };

  // Handler for opening the edit form and populating it with selected CTC data
  const handleEditClick = (ctc) => {
    setSelectedCTC(ctc);
    setFormData({
      effectiveFrom: ctc.effectiveFrom.split('T')[0], // Format date for input type="date"
      basicSalary: ctc.basicSalary.toString(),
      hra: ctc.hra.toString(),
      allowances: ctc.allowances.toString(),
      bonuses: ctc.bonuses.toString(),
      pfContribution: ctc.pfContribution.toString(),
      gratuity: ctc.gratuity.toString(),
      totalCTC: ctc.totalCTC.toString(),
      da: ctc.da ? ctc.da.toString() : '0',
      specialAllowance: ctc.specialAllowance ? ctc.specialAllowance.toString() : '0'
    });
    setShowEditForm(true);
    setShowAddForm(false); // Close add form if open
  };

  // Resets the form data and selected CTC
  const resetForm = () => {
    setFormData({
      effectiveFrom: '',
      basicSalary: '',
      hra: '',
      allowances: '',
      bonuses: '',
      pfContribution: '',
      gratuity: '',
      totalCTC: '',
      da: '',
      specialAllowance: ''
    });
    setSelectedCTC(null);
  };

  // Calculates total CTC based on form inputs
  const calculateTotalCTC = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const pf = parseFloat(formData.pfContribution) || 0;
    const gratuity = parseFloat(formData.gratuity) || 0;
    const da = parseFloat(formData.da) || 0;
    const specialAllowance = parseFloat(formData.specialAllowance) || 0;

    const total = basic + hra + allowances + bonuses + pf + gratuity + da + specialAllowance;
    setFormData(prev => ({ ...prev, totalCTC: total.toString() }));
  };

  // Effect to recalculate total CTC whenever relevant form fields change
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

      {/* Message display for success/error */}
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {isHR ? (
        // HR Dashboard Layout
        <div className="ctc-management-grid">
          {/* Employee List Section */}
          <div className="employee-list-section">
            <h2>Employees</h2>
            <div className="employee-list">
              {employees.map(employee => (
                <div
                  key={employee.id}
                  className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <div className="employee-avatar">
                      {employee.name ? employee.name.charAt(0) : 'U'}
                    </div>
                  <div className="employee-info">
                    <h3>{employee.name}</h3>
                    <p>{employee.position}</p>
                    <p>{employee.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTC Details Section */}
          <div className="ctc-details-section">
            {selectedEmployee ? (
              <>
                <div className="ctc-header">
                  <h2>CTC - {selectedEmployee.name}</h2>
                  <div className="ctc-actions">
                    <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setShowEditForm(false); resetForm(); }}>
                      Add New CTC
                    </button>
                  </div>
                </div>

                {/* CTC History Display */}
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
              // Prompt to select an employee
              <div className="no-selection">
                <h2>Select an Employee</h2>
                <p>Choose an employee from the list to view and manage their CTC.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Employee Dashboard Layout
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

      {/* Add CTC Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New CTC</h3>
              <button className="close-btn" onClick={() => { setShowAddForm(false); resetForm(); }}>×</button>
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
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CTC Form Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit CTC</h3>
              <button className="close-btn" onClick={() => { setShowEditForm(false); resetForm(); }}>×</button>
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
                <label>Dearness Allowance:</label>
                <input
                  type="number"
                  value={formData.da}
                  onChange={(e) => setFormData(prev => ({ ...prev, da: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Special Allowance:</label>
                <input
                  type="number"
                  value={formData.specialAllowance}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialAllowance: e.target.value }))}
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
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditForm(false); resetForm(); }}>
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
