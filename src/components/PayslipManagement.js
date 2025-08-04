import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css';
import html2pdf from 'html2pdf.js';

const PayslipManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      setMessage('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  const loadPayslips = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/payslip/employee/${employeeId}/all`);
      const data = await response.json();
      if (data.success) {
        setPayslips(data.data);
      }
    } catch (error) {
      console.error('Error loading payslips:', error);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    loadPayslips(employee.id);
    setShowGenerateForm(false);
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setMessage('Please select an employee first');
      return;
    }

    // Check if trying to generate payslip for current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    if (selectedMonth.toLowerCase() === currentMonth.toLowerCase() && 
        selectedYear === currentYear) {
      setMessage('❌ Professional Policy: Payslips can only be generated for completed months. Current month payslips will be available after the month ends.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/payslip/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          month: selectedMonth,
          year: selectedYear
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('Payslip generated successfully');
        setShowGenerateForm(false);
        loadPayslips(selectedEmployee.id);
      } else {
        setMessage(data.message || 'Error generating payslip');
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      setMessage('Error generating payslip');
    }
  };

  const handleGenerateAllPayslips = async () => {
    if (!selectedMonth || !selectedYear) {
      setMessage('Please select month and year');
      return;
    }

    // Check if trying to generate payslips for current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    if (selectedMonth.toLowerCase() === currentMonth.toLowerCase() && 
        selectedYear === currentYear) {
      setMessage('❌ Professional Policy: Payslips can only be generated for completed months. Current month payslips will be available after the month ends.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/payslip/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Payslips generated successfully for ${data.data.length} employees`);
        if (selectedEmployee) {
          loadPayslips(selectedEmployee.id);
        }
      } else {
        setMessage(data.message || 'Error generating payslips');
      }
    } catch (error) {
      console.error('Error generating payslips:', error);
      setMessage('Error generating payslips');
    }
  };

  const handleDownloadPayslip = async (payslip) => {
    try {
      // For now, we'll use the backend API since we don't have the payslip template in this component
      // In the future, we could add a modal with the payslip template here as well
      const response = await fetch(`http://localhost:8081/api/payslip/download-pdf/${payslip.employeeId}/${payslip.month}/${payslip.year}`);
      
      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage('Payslip downloaded successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error downloading payslip');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setMessage('Error downloading payslip');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Payslip Management</h1>
        <p>Generate and manage employee payslips</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="payslip-management-grid">
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

        {/* Payslip Details */}
        <div className="payslip-details-section">
          {selectedEmployee ? (
            <>
              <div className="payslip-header">
                <h2>Payslips - {selectedEmployee.name}</h2>
                <div className="payslip-actions">
                  <button className="btn btn-primary" onClick={() => setShowGenerateForm(true)}>
                    Generate Payslip
                  </button>
                </div>
              </div>

              {/* Payslip List */}
              <div className="payslip-list">
                <h3>Payslip History</h3>
                {payslips.length > 0 ? (
                  <div className="payslip-grid">
                    {payslips.map((payslip) => (
                      <div key={payslip.payslipId} className="payslip-card">
                        <div className="payslip-header">
                          <h4>{payslip.month} {payslip.year}</h4>
                          <span className="payslip-status">Generated</span>
                        </div>
                        <div className="payslip-details">
                          <div className="payslip-item">
                            <span>Net Pay:</span>
                            <span>₹{payslip.netPay.toLocaleString()}</span>
                          </div>
                          <div className="payslip-item">
                            <span>Deductions:</span>
                            <span>₹{payslip.deductions.toLocaleString()}</span>
                          </div>
                          <div className="payslip-item">
                            <span>Generated:</span>
                            <span>{new Date(payslip.generatedOn).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="payslip-actions">
                          <button 
                            className="btn btn-small btn-primary"
                            onClick={() => handleDownloadPayslip(payslip)}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No payslips found for this employee.</p>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h2>Select an Employee</h2>
              <p>Choose an employee from the list to view and manage their payslips.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Generate Payslips */}
      <div className="bulk-generate-section">
        <h2>Bulk Payslip Generation</h2>
        <div className="bulk-generate-form">
          <div className="form-group">
            <label>Month:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateAllPayslips}
            disabled={!selectedMonth || !selectedYear}
          >
            Generate All Payslips
          </button>
        </div>
      </div>

      {/* Generate Payslip Form */}
      {showGenerateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Generate Payslip</h3>
              <button className="close-btn" onClick={() => setShowGenerateForm(false)}>×</button>
            </div>
            <form onSubmit={handleGeneratePayslip} className="payslip-form">
              <div className="form-group">
                <label>Employee:</label>
                <input
                  type="text"
                  value={selectedEmployee?.name || ''}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Month:</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year:</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  required
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Generate Payslip</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateForm(false)}>
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

export default PayslipManagement; 