import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css';
import html2pdf from 'html2pdf.js';
import PaymentHoldModal from './PaymentHoldModal';
import PayslipTemplate from './PayslipTemplate';

const PayslipManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeesWithHold, setEmployeesWithHold] = useState([]);
  const [showPaymentHoldModal, setShowPaymentHoldModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [ctcData, setCtcData] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadEmployees();
    loadPaymentHoldStatus();
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
  
  const loadPaymentHoldStatus = async () => {
    try {
      console.log('Loading payment hold status...'); // Debug log
      const response = await fetch('http://localhost:8081/api/employees/payment-hold');
      console.log('Payment hold response status:', response.status); // Debug log
      console.log('Payment hold response headers:', response.headers); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('Payment hold status loaded:', data); // Debug log
        console.log('Payment hold data type:', typeof data); // Debug log
        console.log('Payment hold data length:', Array.isArray(data) ? data.length : 'Not an array'); // Debug log
        
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            console.log(`Payment hold item ${index}:`, item); // Debug log
            console.log(`Item ${index} employeeId:`, item.employeeId); // Debug log
            console.log(`Item ${index} type:`, typeof item.employeeId); // Debug log
          });
        }
        
        setEmployeesWithHold(data);
      } else {
        console.error('Failed to load payment hold status:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText); // Debug log
      }
    } catch (error) {
      console.error('Error loading payment hold status:', error);
    }
  };

  // Helper function to check if an employee has a payment hold
  const hasPaymentHold = (employeeId) => {
    console.log(`Checking payment hold for employee ${employeeId}`); // Debug log
    console.log(`Current employeesWithHold state:`, employeesWithHold); // Debug log
    const hasHold = employeesWithHold.some(emp => emp.employeeId === employeeId);
    console.log(`Employee ${employeeId} has payment hold: ${hasHold}`); // Debug log
    return hasHold;
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log('employeesWithHold state changed:', employeesWithHold);
  }, [employeesWithHold]);
  
  const togglePaymentHold = (employee) => {
    setSelectedEmployee(employee);
    setShowPaymentHoldModal(true);
  };
  
  const handlePaymentHoldSuccess = async (successMessage) => {
    setMessage(`✅ ${successMessage}`);
    
    // Add a small delay to ensure the backend has processed the request
    setTimeout(async () => {
      await loadPaymentHoldStatus(); // Reload payment hold status
      await loadEmployees(); // Reload employees to get updated payment hold status
    }, 500);
  };

  const loadPayslips = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/payslip/employee/${employeeId}/all`);
      const data = await response.json();
      if (data.success) {
        // Filter out September 2025 payslips
        const filteredPayslips = data.data.filter(payslip => 
          !(payslip.month === 'September' && payslip.year === 2025)
        );
        setPayslips(filteredPayslips);
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

    // Check if trying to generate payslip for future months
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 for Jan-Dec
    const currentYear = currentDate.getFullYear();
    
    // Convert selected month to index (0-11)
    const selectedMonthIndex = months.findIndex(month => month === selectedMonth);
    
    // Check if selected date is in the future
    if (selectedYear > currentYear || 
        (selectedYear === currentYear && selectedMonthIndex > currentMonth)) {
      setMessage('❌ Professional Policy: Payslips can only be generated for completed or current months, not future months.');
      return;
    }
    
    // Check if month and year are selected
    if (!selectedMonth || !selectedYear) {
      setMessage('Please select month and year');
      return;
    }

    try {
      setMessage('Generating payslip...');
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
        setMessage('✅ Payslip generated successfully');
        setShowGenerateForm(false);
        loadPayslips(selectedEmployee.id);
      } else {
        setMessage(`❌ ${data.message || 'Error generating payslip'}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      setMessage(`❌ Error generating payslip: ${error.message}`);
    }
  };

  const handleDownloadPayslip = async (payslip) => {
    try {
      // Use client-side PDF generation with html2pdf
      // First, we need to show the payslip template to generate the PDF from
      setSelectedPayslip(payslip);
      
      // Wait a bit for the template to render, then generate PDF
      setTimeout(() => {
        const payslipElement = document.querySelector('.payslip-container');
        if (payslipElement) {
          const opt = {
            margin: 0.5,
            filename: `payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: true, letterRendering: true, allowTaint: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(payslipElement).save().then(() => {
            setMessage('Payslip downloaded successfully');
            setTimeout(() => setMessage(''), 3000);
            setSelectedPayslip(null);
          }).catch((error) => {
            console.error('Error generating PDF:', error);
            setMessage('Error generating PDF');
            setTimeout(() => setMessage(''), 3000);
            setSelectedPayslip(null);
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setMessage('Error downloading payslip');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Fetch CTC details for a given employee
  const fetchCtcData = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/ctc/employee/${employeeId}/summary`);
      const data = await response.json();
      if (data.success && data.data) {
        setCtcData(data.data);
      } else {
        setCtcData(null);
      }
    } catch (error) {
      setCtcData(null);
    }
  };

  // When opening the payslip modal, fetch CTC for the payslip's employee
  useEffect(() => {
    if (selectedPayslip) {
      fetchCtcData(selectedPayslip.employeeId);
    }
  }, [selectedPayslip]);

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
                className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''} ${hasPaymentHold(employee.id) ? 'payment-hold' : ''}`}
              >
                <div className="employee-card-content" onClick={() => handleEmployeeSelect(employee)}>
                  <div className="employee-avatar">
                    {employee.name ? employee.name.charAt(0) : 'U'}
                  </div>
                  <div className="employee-info">
                    <h3>{employee.name}</h3>
                    {hasPaymentHold(employee.id) && (
                      <span className="payment-hold-badge" title={employeesWithHold.find(emp => emp.employeeId === employee.id)?.reason || 'Payment on hold'}>
                        Payment Hold
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === 'HR' || user?.role === 'ADMIN' ? (
                  <div className="employee-actions">
                    <button 
                      className={`btn btn-small ${hasPaymentHold(employee.id) ? 'btn-warning' : 'btn-secondary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePaymentHold(employee);
                      }}
                    >
                      {hasPaymentHold(employee.id) ? 'Remove Hold' : 'Hold Payment'}
                    </button>
                  </div>
                ) : null}
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
                {/* Action Buttons */}
                <div className="payslip-actions">
                  <button className="btn btn-primary" onClick={handleGeneratePayslip}>
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

      {/* Month/Year Selection */}
      <div className="month-year-selection">
        <h2>Payslip Generation</h2>
        <div className="month-year-form">
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

      {/* Payslip Template Modal for Download */}
      {selectedPayslip && (
        <PayslipTemplate
          payslipData={{ ...selectedPayslip, ...ctcData }}
          employeeData={employees.find(emp => emp.id === selectedPayslip.employeeId) || selectedEmployee}
          onClose={() => setSelectedPayslip(null)}
          onDownload={() => handleDownloadPayslip(selectedPayslip)}
        />
      )}

      {/* Payment Hold Modal */}
      {showPaymentHoldModal && selectedEmployee && (
        <PaymentHoldModal
          isOpen={showPaymentHoldModal}
          onClose={() => setShowPaymentHoldModal(false)}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          currentUser={user}
          onSuccess={handlePaymentHoldSuccess}
        />
      )}
    </div>
  );
};

export default PayslipManagement;