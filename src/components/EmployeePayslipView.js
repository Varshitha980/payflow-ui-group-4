import React, { useState, useEffect } from 'react';
import './ModernDashboardStyles.css';
import PayslipTemplate from './PayslipTemplate';
import html2pdf from 'html2pdf.js';

const EmployeePayslipView = ({ user, onBack, keepNavVisible = true }) => {
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
          const parsedCtcData = {
            ...ctcData.data,
            basicSalary: parseFloat(ctcData.data.basicSalary) || 0,
            hra: parseFloat(ctcData.data.hra) || 0,
            allowances: parseFloat(ctcData.data.allowances) || 0,
            bonuses: parseFloat(ctcData.data.bonuses) || 0,
            pfContribution: parseFloat(ctcData.data.pfContribution) || 0,
            gratuity: parseFloat(ctcData.data.gratuity) || 0,
            totalCtc: parseFloat(ctcData.data.totalCtc) || 0
          };
          
          if (!parsedCtcData.totalCtc) {
            parsedCtcData.totalCtc = (
              parsedCtcData.basicSalary +
              parsedCtcData.hra +
              parsedCtcData.allowances +
              parsedCtcData.bonuses +
              parsedCtcData.pfContribution +
              parsedCtcData.gratuity
            );
          }
          
          setCtcDetails(parsedCtcData);
          console.log('CTC Details loaded:', parsedCtcData);
        } else {
          console.log('Summary endpoint failed, trying history endpoint...');
          const historyResponse = await fetch(`http://localhost:8081/api/ctc/employee/${user.id}/history`);
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.data && historyData.data.length > 0) {
            const parsedHistoryData = {
              ...historyData.data[0],
              basicSalary: parseFloat(historyData.data[0].basicSalary) || 0,
              hra: parseFloat(historyData.data[0].hra) || 0,
              allowances: parseFloat(historyData.data[0].allowances) || 0,
              bonuses: parseFloat(historyData.data[0].bonuses) || 0,
              pfContribution: parseFloat(historyData.data[0].pfContribution) || 0,
              gratuity: parseFloat(historyData.data[0].gratuity) || 0,
              totalCtc: parseFloat(historyData.data[0].totalCtc) || 0
            };
            
            if (!parsedHistoryData.totalCtc) {
              parsedHistoryData.totalCtc = (
                parsedHistoryData.basicSalary +
                parsedHistoryData.hra +
                parsedHistoryData.allowances +
                parsedHistoryData.bonuses +
                parsedHistoryData.pfContribution +
                parsedHistoryData.gratuity
              );
            }
            
            setCtcDetails(parsedHistoryData);
            console.log('CTC Details loaded from history:', parsedHistoryData);
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
    const basicSalary = parseFloat(ctcDetails?.basicSalary) || 0;
    const hra = parseFloat(ctcDetails?.hra) || 0;
    const allowances = parseFloat(ctcDetails?.allowances) || 0;
    const bonuses = parseFloat(ctcDetails?.bonuses) || 0;
    const pfContribution = parseFloat(ctcDetails?.pfContribution) || 0;
    const gratuity = parseFloat(ctcDetails?.gratuity) || 0;
    let totalCtc = parseFloat(ctcDetails?.totalCtc) || 0;
    
    if (!totalCtc) {
      totalCtc = basicSalary + hra + allowances + bonuses + pfContribution + gratuity;
    }
    
    const payslipWithCTC = {
      ...payslip,
      basicSalary,
      hra,
      allowances,
      bonuses,
      pfContribution,
      gratuity,
      totalCtc,
    };
    console.log('Viewing payslip with CTC details:', payslipWithCTC);
    setSelectedPayslip(payslipWithCTC);
    setShowPayslipTemplate(true);
  };

  const handleDownloadPayslip = async (payslip) => {
    try {
      const basicSalary = parseFloat(ctcDetails?.basicSalary) || 0;
      const hra = parseFloat(ctcDetails?.hra) || 0;
      const allowances = parseFloat(ctcDetails?.allowances) || 0;
      const bonuses = parseFloat(ctcDetails?.bonuses) || 0;
      const pfContribution = parseFloat(ctcDetails?.pfContribution) || 0;
      const gratuity = parseFloat(ctcDetails?.gratuity) || 0;
      let totalCtc = parseFloat(ctcDetails?.totalCtc) || 0;
      
      if (!totalCtc) {
        totalCtc = basicSalary + hra + allowances + bonuses + pfContribution + gratuity;
      }
      
      const payslipWithCTC = {
        ...payslip,
        basicSalary,
        hra,
        allowances,
        bonuses,
        pfContribution,
        gratuity,
        totalCtc,
      };
      console.log('Downloading payslip with CTC details:', payslipWithCTC);
      setSelectedPayslip(payslipWithCTC);
      setShowPayslipTemplate(true);
      
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
      }, 2000);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setMessage('Error downloading payslip');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDownloadPDF = () => {
    setTimeout(() => {
      const payslipElement = document.querySelector('.payslip-container');
      if (payslipElement) {
        const opt = {
          margin: 0.5,
          filename: `payslip_${selectedPayslip?.employeeId}_${selectedPayslip?.month}_${selectedPayslip?.year}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: true, letterRendering: true, allowTaint: true },
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
    }, 2000);
  };

  const closePayslipTemplate = () => {
    setShowPayslipTemplate(false);
    setSelectedPayslip(null);
  };

  const filterPayslips = () => {
    let filtered = payslips;
    
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    filtered = filtered.filter(payslip => {
      const isCurrentMonth = payslip.month.toLowerCase() === currentMonth.toLowerCase() && 
                             payslip.year === currentYear;
      return !isCurrentMonth;
    });
    
    if (filterYear) {
      filtered = filtered.filter(payslip => payslip.year.toString() === filterYear);
    }
    
    if (filterMonth) {
      filtered = filtered.filter(payslip => payslip.month.toLowerCase() === filterMonth.toLowerCase());
    }
    
    setFilteredPayslips(filtered);
  };

  useEffect(() => {
    filterPayslips();
  }, [filterYear, filterMonth, payslips]);

  const clearFilters = () => {
    setFilterYear('');
    setFilterMonth('');
    setFilteredPayslips(payslips);
  };

  const getUniqueYears = () => {
    const years = [...new Set(payslips.map(payslip => payslip.year))];
    return years.sort((a, b) => b - a);
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

  // Corrected logic for calculating leave stats and deduction
  const calculateLeaveStats = () => {
    const annualLeaveAllowance = 12;
    const currentYear = new Date().getFullYear();
    
    const totalUsedLeavesThisYear = leaveRequests
      .filter(lr => {
        const leaveDate = new Date(lr.startDate);
        return lr.status === 'APPROVED' && leaveDate.getFullYear() === currentYear;
      })
      .reduce((total, lr) => total + (lr.days || 1), 0);
    
    const usedLeavesThisMonth = leaveRequests
      .filter(lr => {
        const leaveDate = new Date(lr.startDate);
        return lr.status === 'APPROVED' && 
               leaveDate.getMonth() === new Date().getMonth() && 
               leaveDate.getFullYear() === currentYear;
      })
      .reduce((total, lr) => total + (lr.days || 1), 0);
    
    const remainingLeaves = Math.max(0, annualLeaveAllowance - totalUsedLeavesThisYear);
    const excessLeaves = Math.max(0, totalUsedLeavesThisYear - annualLeaveAllowance);
    
    return { 
      totalLeaves: annualLeaveAllowance, 
      usedLeaves: usedLeavesThisMonth,
      totalUsedLeavesThisYear,
      remainingLeaves, 
      excessLeaves 
    };
  };

  const calculateMonthlySalary = (ctcData) => {
    if (!ctcData || !ctcData.totalCtc) return 0;
    return ctcData.totalCtc / 12;
  };
  
  const calculateDailySalary = (ctcData) => {
    if (!ctcData || !ctcData.totalCtc) return 0;
    const monthlySalary = calculateMonthlySalary(ctcData);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return monthlySalary / daysInMonth;
  };

  const calculateLeaveDeduction = (ctcData) => {
    const { excessLeaves } = calculateLeaveStats();
    const dailySalary = calculateDailySalary(ctcData);
    return dailySalary * excessLeaves;
  };

  const calculateFinalMonthlySalary = (ctcData) => {
    const monthlySalary = calculateMonthlySalary(ctcData);
    const leaveDeduction = calculateLeaveDeduction(ctcData);
    return monthlySalary - leaveDeduction;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { totalLeaves, usedLeaves, totalUsedLeavesThisYear, excessLeaves } = calculateLeaveStats();

  return (
    <div className="dashboard-container" style={{ display: 'flex' }}>
      {keepNavVisible && (
        <div className="dashboard-sidebar" style={{
          width: '280px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: '20px',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 40px)',
          position: 'sticky',
          top: '20px',
          marginRight: '24px'
        }}>
          <div style={{ padding: '0 24px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                👤
              </div>
              <div>
                <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: 'white' }}>{user?.name || 'Employee'}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ marginBottom: '8px' }}>
              <button
                onClick={() => onBack()}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '18px' }}>📊</span>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="dashboard-main" style={{ flex: '1' }}>
        <div className="dashboard-header" style={{ position: 'relative' }}>
          <div className="header-content">
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {!keepNavVisible && (
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
              )}
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
        <div className="ctc-summary-section">
          <h2>Current CTC Summary</h2>
          {ctcDetails ? (
            <div className="ctc-summary-card">
              <div className="ctc-breakdown">
                <div className="ctc-item">
                  <span>Gratuity:</span>
                  <span>₹{parseFloat(ctcDetails.gratuity).toLocaleString()}</span>
                </div>
                <div className="ctc-item total">
                  <span>Total CTC:</span>
                  <span>₹{parseFloat(ctcDetails.totalCtc).toLocaleString()}</span>
                </div>
                <div className="ctc-item">
                  <span>Monthly Salary:</span>
                  <span>₹{calculateMonthlySalary(ctcDetails).toLocaleString()}</span>
                </div>
                <div className="ctc-item">
                  <span>Daily Salary:</span>
                  <span>₹{calculateDailySalary(ctcDetails).toLocaleString()}</span>
                </div>
                <div className="ctc-item">
                  <span>Leaves Used This Month:</span>
                  <span>{usedLeaves} days</span>
                </div>
                <div className="ctc-item">
                  <span>Total Leaves Used This Year:</span>
                  <span>{totalUsedLeavesThisYear} days (Annual Limit: {totalLeaves})</span>
                </div>
                <div className="ctc-item">
                  <span>Excess Leave Deduction:</span>
                  <span>₹{calculateLeaveDeduction(ctcDetails).toLocaleString()}</span>
                </div>
                <div className="ctc-item total">
                  <span>Final Monthly Salary:</span>
                  <span>₹{calculateFinalMonthlySalary(ctcDetails).toLocaleString()}</span>
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

        <div className="payslips-section">
          <div className="payslips-header">
            <h2>My Payslips</h2>
            
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

      {showPayslipTemplate && selectedPayslip && (
        <PayslipTemplate
          payslipData={selectedPayslip}
          employeeData={employeeData || user}
          onClose={closePayslipTemplate}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  </div>
  );
};

export default EmployeePayslipView;