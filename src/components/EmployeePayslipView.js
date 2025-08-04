import React, { useState, useEffect, useRef } from 'react';
import './ModernDashboardStyles.css';
import PayslipTemplate from './PayslipTemplate';
import html2pdf from 'html2pdf.js';

const EmployeePayslipView = ({ user, onBack }) => {
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [ctcDetails, setCtcDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showPayslipTemplate, setShowPayslipTemplate] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      loadEmployeeData();
    }
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      // Load payslips
      const payslipsResponse = await fetch(`http://localhost:8081/api/payslip/employee/${user.id}/all`);
      const payslipsData = await payslipsResponse.json();
      if (payslipsData.success) {
        setPayslips(payslipsData.data);
        setFilteredPayslips(payslipsData.data);
      } else {
        console.error('Payslips API error:', payslipsData.message);
      }

      // Load complete employee data including designation and department
      try {
        const employeeResponse = await fetch(`http://localhost:8081/api/employees/${user.id}`);
        const employeeData = await employeeResponse.json();
        if (employeeData) {
          setEmployeeData(employeeData);
        }
      } catch (error) {
        console.error('Employee API error:', error);
      }

      // Load leave requests for leave balance calculation
      try {
        const leaveResponse = await fetch(`http://localhost:8081/api/leaves?employeeId=${user.id}`);
        const leaveData = await leaveResponse.json();
        setLeaveRequests(Array.isArray(leaveData) ? leaveData : []);
      } catch (error) {
        console.error('Leave API error:', error);
        setLeaveRequests([]);
      }

      // Load CTC details - use history endpoint as fallback
      try {
        const ctcResponse = await fetch(`http://localhost:8081/api/ctc/employee/${user.id}/summary`);
        const ctcData = await ctcResponse.json();
        if (ctcData.success && ctcData.data) {
          setCtcDetails(ctcData.data);
          console.log('CTC Details loaded:', ctcData.data);
        } else {
          // Fallback to history endpoint
          console.log('Summary endpoint failed, trying history endpoint...');
          const historyResponse = await fetch(`http://localhost:8081/api/ctc/employee/${user.id}/history`);
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.data && historyData.data.length > 0) {
            setCtcDetails(historyData.data[0]); // Get the first (most recent) record
            console.log('CTC Details loaded from history:', historyData.data[0]);
          } else {
            console.error('CTC API error:', historyData.message);
            setMessage('CTC information not available');
          }
        }
      } catch (error) {
        console.error('CTC API error:', error);
        setMessage('CTC information not available');
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payslip) => {
    // Combine payslip data with CTC data for the payslip template
    const payslipWithCTC = {
      ...payslip,
      // Add CTC details to the payslip data
      basicSalary: ctcDetails?.basicSalary || 0,
      hra: ctcDetails?.hra || 0,
      allowances: ctcDetails?.allowances || 0,
      bonuses: ctcDetails?.bonuses || 0,
      pfContribution: ctcDetails?.pfContribution || 0,
      gratuity: ctcDetails?.gratuity || 0,
      totalCtc: ctcDetails?.totalCtc || 0,
    };
    setSelectedPayslip(payslipWithCTC);
    setShowPayslipTemplate(true);
  };

  const handleDownloadPayslip = async (payslip) => {
    try {
      // First, set the selected payslip to show the template
      const payslipWithCTC = {
        ...payslip,
        // Add CTC details to the payslip data
        basicSalary: ctcDetails?.basicSalary || 0,
        hra: ctcDetails?.hra || 0,
        allowances: ctcDetails?.allowances || 0,
        bonuses: ctcDetails?.bonuses || 0,
        pfContribution: ctcDetails?.pfContribution || 0,
        gratuity: ctcDetails?.gratuity || 0,
        totalCtc: ctcDetails?.totalCtc || 0,
      };
      setSelectedPayslip(payslipWithCTC);
      setShowPayslipTemplate(true);
      
      // Wait for the template to render, then generate PDF
      setTimeout(() => {
        const payslipElement = document.querySelector('.payslip-container');
        if (payslipElement) {
          const opt = {
            margin: 0.5,
            filename: `payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(payslipElement).save().then(() => {
            setMessage('Payslip downloaded successfully');
            setTimeout(() => setMessage(''), 3000);
            // Close the template after successful download
            setShowPayslipTemplate(false);
            setSelectedPayslip(null);
          }).catch((error) => {
            console.error('Error generating PDF:', error);
            setMessage('Error generating PDF');
            setTimeout(() => setMessage(''), 3000);
            setShowPayslipTemplate(false);
            setSelectedPayslip(null);
          });
        }
      }, 500); // Give enough time for the template to render
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setMessage('Error downloading payslip');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDownloadPDF = () => {
    // Generate PDF using html2pdf from the payslip template
    const payslipElement = document.querySelector('.payslip-container');
    if (payslipElement) {
      const opt = {
        margin: 0.5,
        filename: `payslip_${selectedPayslip?.employeeId}_${selectedPayslip?.month}_${selectedPayslip?.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(payslipElement).save().then(() => {
        setMessage('Payslip downloaded successfully');
        setTimeout(() => setMessage(''), 3000);
      }).catch((error) => {
        console.error('Error generating PDF:', error);
        setMessage('Error generating PDF');
        setTimeout(() => setMessage(''), 3000);
      });
    }
  };

  const closePayslipTemplate = () => {
    setShowPayslipTemplate(false);
    setSelectedPayslip(null);
  };

  // Filter payslips based on year and month, and hide current month payslips
  const filterPayslips = () => {
    let filtered = payslips;
    
    // Get current date
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Filter out payslips for the current month (professional requirement)
    filtered = filtered.filter(payslip => {
      const isCurrentMonth = payslip.month.toLowerCase() === currentMonth.toLowerCase() && 
                           payslip.year === currentYear;
      return !isCurrentMonth; // Hide current month payslips
    });
    
    if (filterYear) {
      filtered = filtered.filter(payslip => payslip.year.toString() === filterYear);
    }
    
    if (filterMonth) {
      filtered = filtered.filter(payslip => payslip.month.toLowerCase() === filterMonth.toLowerCase());
    }
    
    setFilteredPayslips(filtered);
  };

  // Auto-filter when selections change
  useEffect(() => {
    filterPayslips();
  }, [filterYear, filterMonth, payslips]);

  // Clear filters
  const clearFilters = () => {
    setFilterYear('');
    setFilterMonth('');
    setFilteredPayslips(payslips);
  };

  // Get unique years and months for filter options
  const getUniqueYears = () => {
    const years = [...new Set(payslips.map(payslip => payslip.year))];
    return years.sort((a, b) => b - a); // Sort in descending order
  };

  const getUniqueMonths = () => {
    const months = [...new Set(payslips.map(payslip => payslip.month))];
    return months.sort((a, b) => {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });
  };

  // Calculate leave balance and used leaves
  const calculateLeaveStats = () => {
    const totalLeaves = 12; // Default leave balance
    const usedLeaves = leaveRequests
      .filter(lr => lr.status === 'APPROVED')
      .reduce((total, lr) => total + (lr.days || 1), 0);
    const remainingLeaves = totalLeaves - usedLeaves;
    const excessLeaves = remainingLeaves < 0 ? Math.abs(remainingLeaves) : 0;
    
    return { totalLeaves, usedLeaves, remainingLeaves, excessLeaves };
  };

  // Calculate daily salary correctly (based on monthly salary and days in month)
  const calculateDailySalary = (ctcData) => {
    if (!ctcData || !ctcData.totalCtc) return 0;
    
    const monthlySalary = ctcData.totalCtc / 12;
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    return monthlySalary / daysInMonth;
  };

  // Calculate excess leave deduction
  const calculateLeaveDeduction = (ctcData) => {
    const { excessLeaves } = calculateLeaveStats();
    if (excessLeaves <= 0) return 0;
    
    const dailySalary = calculateDailySalary(ctcData);
    return dailySalary * excessLeaves;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { totalLeaves, usedLeaves, remainingLeaves, excessLeaves } = calculateLeaveStats();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ position: 'relative' }}>
        <div className="header-content">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => onBack()}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ← Back to Dashboard
            </button>
            <h1 style={{ margin: 0 }}>My Payslips & CTC</h1>
          </div>
        </div>
        <p>View your payslips and compensation details</p>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px',
          fontSize: '14px',
          color: '#0c4a6e'
        }}>
          <strong>📅 Professional Policy:</strong> Payslips are only available for completed months. 
          Current month payslips will be generated after the month ends.
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="employee-payslip-grid">
        {/* CTC Summary */}
        <div className="ctc-summary-section">
          <h2>Current CTC Summary</h2>
          {ctcDetails ? (
            <div className="ctc-summary-card">
              <div className="ctc-breakdown">
                <div className="ctc-item">
                  <span>Basic Salary:</span>
                  <span>₹{ctcDetails.basicSalary ? ctcDetails.basicSalary.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>HRA:</span>
                  <span>₹{ctcDetails.hra ? ctcDetails.hra.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>Allowances:</span>
                  <span>₹{ctcDetails.allowances ? ctcDetails.allowances.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>Bonuses:</span>
                  <span>₹{ctcDetails.bonuses ? ctcDetails.bonuses.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>PF Contribution:</span>
                  <span>₹{ctcDetails.pfContribution ? ctcDetails.pfContribution.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>Gratuity:</span>
                  <span>₹{ctcDetails.gratuity ? ctcDetails.gratuity.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item total">
                  <span>Total CTC:</span>
                  <span>₹{ctcDetails.totalCtc ? ctcDetails.totalCtc.toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>Monthly Salary:</span>
                  <span>₹{ctcDetails.totalCtc ? (ctcDetails.totalCtc / 12).toLocaleString() : '0'}</span>
                </div>
                <div className="ctc-item">
                  <span>Daily Salary:</span>
                  <span>₹{calculateDailySalary(ctcDetails).toLocaleString()}</span>
                </div>
                <div className="ctc-item">
                  <span>Leaves Used:</span>
                  <span>{usedLeaves} days</span>
                </div>
                <div className="ctc-item">
                  <span>Excess Leave Deduction:</span>
                  <span>₹{calculateLeaveDeduction(ctcDetails).toLocaleString()}</span>
                </div>
              </div>
              <div className="ctc-effective-date">
                <p>Effective from: {ctcDetails.effectiveFrom ? new Date(ctcDetails.effectiveFrom).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="no-ctc">
              <p>No CTC information available.</p>
            </div>
          )}
        </div>

        {/* Payslips */}
        <div className="payslips-section">
          <div className="payslips-header">
            <h2>My Payslips</h2>
            
            {/* Filter Controls */}
            <div className="filter-controls">
              <div className="filter-group">
                <label>Year:</label>
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Years</option>
                  {getUniqueYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Month:</label>
                <select 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Months</option>
                  {getUniqueMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-secondary filter-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {filteredPayslips.length > 0 ? (
            <div className="payslips-grid">
              {filteredPayslips.map((payslip) => (
                <div key={payslip.payslipId} className="payslip-card">
                  <div className="payslip-header">
                    <h3>{payslip.month} {payslip.year}</h3>
                    <span className="payslip-status">Generated</span>
                  </div>
                  <div className="payslip-details">
                    <div className="payslip-item">
                      <span>Net Pay:</span>
                      <span className="net-pay">₹{payslip.netPay.toLocaleString()}</span>
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
                      className="btn btn-secondary"
                      onClick={() => handleViewPayslip(payslip)}
                    >
                      View Payslip
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleDownloadPayslip(payslip)}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-payslips">
              <p>
                {payslips.length > 0 
                  ? 'No payslips match the selected filters.' 
                  : 'No payslips available yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Payslips</h3>
          <span className="stat-number">{payslips.length}</span>
        </div>
        <div className="stat-card">
          <h3>Filtered Payslips</h3>
          <span className="stat-number">{filteredPayslips.length}</span>
        </div>
        <div className="stat-card">
          <h3>Latest Payslip</h3>
          <span className="stat-text">
            {payslips.length > 0 
              ? `${payslips[0].month} ${payslips[0].year}`
              : 'Not available'
            }
          </span>
        </div>
        <div className="stat-card">
          <h3>Current Monthly Salary</h3>
          <span className="stat-number">
            {ctcDetails && ctcDetails.totalCtc
              ? `₹${(ctcDetails.totalCtc / 12).toLocaleString()}`
              : 'Not available'
            }
          </span>
        </div>
      </div>

      {/* Payslip Template Modal */}
      {showPayslipTemplate && selectedPayslip && (
        <PayslipTemplate
          payslipData={selectedPayslip}
          employeeData={employeeData || user}
          onClose={closePayslipTemplate}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default EmployeePayslipView; 