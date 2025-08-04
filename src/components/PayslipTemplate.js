import React from 'react';
import './PayslipTemplate.css';

const PayslipTemplate = ({ payslipData, employeeData, onClose, onDownload }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate daily amounts based on month
  const calculateDailyAmount = (annualAmount, month, year) => {
    if (!annualAmount || !month || !year) return 0;
    
    const monthNumber = new Date(`${month} 1, ${year}`).getMonth();
    const daysInMonth = new Date(year, monthNumber + 1, 0).getDate();
    
    return (annualAmount / 365) * daysInMonth; // Daily rate × days in month
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatMonthYear = (month, year) => {
    if (!month || !year) return 'N/A';
    return `${month} ${year}`;
  };

  return (
    <div className="payslip-overlay">
      <div className="payslip-container">
        <div className="payslip-header">
          <div className="company-info">
            <div className="logo-section">
              <div className="company-logo">
                <span className="logo-text">T</span>
              </div>
                             <div className="company-name">
                 <h2>Company Name</h2>
                 <p>Payroll Management System</p>
               </div>
            </div>
          </div>
          <div className="company-bar">
            <span>Company Name</span>
          </div>
          <div className="payslip-title-bar">
            <span>Pay Slip</span>
          </div>
        </div>

        <div className="employee-info">
          <div className="info-row">
            <span className="label">Employee Name :</span>
            <span className="value">{employeeData?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Designation :</span>
            <span className="value">{employeeData?.position || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Department :</span>
            <span className="value">{employeeData?.department || 'N/A'}</span>
          </div>
                     <div className="info-row">
             <span className="label">Month :</span>
             <span className="value">{formatMonthYear(payslipData?.month, payslipData?.year)}</span>
           </div>
        </div>

        <div className="payslip-table">
          <div className="earnings-section">
            <div className="section-header">
              <h3>Earnings</h3>
              <div className="sub-headers">
                <span>Salary head</span>
                <span>Amount</span>
              </div>
            </div>
                         <div className="salary-items">
               <div className="salary-item">
                 <span>Basic Salary</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.basicSalary, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.basicSalary?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>HRA (House Rent Allowance)</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.hra, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.hra?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>Allowances</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.allowances, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.allowances?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>Bonuses</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.bonuses, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.bonuses?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>PF Contribution</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.pfContribution, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.pfContribution?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>Gratuity</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.gratuity, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.gratuity?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item gross">
                 <span>GROSS SALARY</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.totalCtc, payslipData?.month, payslipData?.year))}</span>
               </div>
               <div className="salary-item total">
                 <span>NET PAY</span>
                 <span>{formatCurrency(payslipData?.netPay)}</span>
                 <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                   (Monthly Salary - Excess Leave Deduction)
                 </div>
               </div>
             </div>
          </div>

          <div className="deductions-section">
            <div className="section-header">
              <h3>Deductions</h3>
              <div className="sub-headers">
                <span>Salary head</span>
                <span>Amount</span>
              </div>
            </div>
                         <div className="salary-items">
               <div className="salary-item">
                 <span>PF Contribution</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.pfContribution, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.pfContribution?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>Gratuity</span>
                 <span>{formatCurrency(calculateDailyAmount(payslipData?.gratuity, payslipData?.month, payslipData?.year))}</span>
                 <div style={{ fontSize: '10px', color: '#666' }}>
                   (₹{payslipData?.gratuity?.toLocaleString() || 0} ÷ 365 × {new Date(payslipData?.year, new Date(`${payslipData?.month} 1, ${payslipData?.year}`).getMonth() + 1, 0).getDate()} days)
                 </div>
               </div>
               <div className="salary-item">
                 <span>Leave Deductions</span>
                 <span>{formatCurrency(payslipData?.deductions)}</span>
               </div>
               <div className="salary-item">
                 <span></span>
                 <span></span>
               </div>
               <div className="salary-item">
                 <span></span>
                 <span></span>
               </div>
               <div className="salary-item">
                 <span></span>
                 <span></span>
               </div>
               <div className="salary-item">
                 <span></span>
                 <span></span>
               </div>
               <div className="salary-item total">
                 <span>Total Deduction</span>
                 <span>{formatCurrency((calculateDailyAmount(payslipData?.pfContribution, payslipData?.month, payslipData?.year) + calculateDailyAmount(payslipData?.gratuity, payslipData?.month, payslipData?.year) + (payslipData?.deductions || 0)))}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="payslip-footer">
          <div className="signature-section">
            <div className="signature-item">
              <span className="signature-label">Prepared by</span>
              <div className="signature-line"></div>
            </div>
            <div className="signature-item">
              <span className="signature-label">Checked by</span>
              <div className="signature-line"></div>
            </div>
            <div className="signature-item">
              <span className="signature-label">Authorized by</span>
              <div className="signature-line"></div>
            </div>
          </div>
        </div>

        <div className="payslip-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={onDownload}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate; 