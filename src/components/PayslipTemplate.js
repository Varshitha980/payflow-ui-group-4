import React from 'react';
import './PayslipTemplate.css';

const PayslipTemplate = ({ payslipData, employeeData, onClose, onDownload }) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Helper function to calculate a monthly amount from an annual amount
  const calculateMonthlyAmount = (annualAmount) => {
    const amount = parseFloat(annualAmount) || 0;
    return amount / 12;
  };

  // Helper function to format month and year for display
  const formatMonthYear = (month, year) => {
    if (!month || !year) return 'N/A';
    return `${month} ${year}`;
  };

  // --- CORRECT CALCULATIONS ---

  // Calculate monthly earnings by dividing annual amounts by 12
  const basicSalaryMonthly = calculateMonthlyAmount(payslipData?.basicSalary);
  const hraMonthly = calculateMonthlyAmount(payslipData?.hra);
  const allowancesMonthly = calculateMonthlyAmount(payslipData?.allowances);
  const bonusesMonthly = calculateMonthlyAmount(payslipData?.bonuses);
  const pfContributionMonthly = calculateMonthlyAmount(payslipData?.pfContribution);
  const gratuityMonthly = calculateMonthlyAmount(payslipData?.gratuity);

  // Gross Salary is the sum of all monthly earnings
  const grossSalaryMonthly =
    basicSalaryMonthly +
    hraMonthly +
    allowancesMonthly +
    bonusesMonthly +
    pfContributionMonthly +
    gratuityMonthly;
    
  // Correctly calculate Total Deductions by summing all monthly deduction items
  // The PF and Gratuity are deductions for the employee, which should be the same as the employer's contribution
  const pfContributionEmployee = pfContributionMonthly;
  const gratuityEmployee = gratuityMonthly;
  const leaveDeductions = parseFloat(payslipData?.leaveDeductions) || 0;

  const totalDeduction = pfContributionEmployee + gratuityEmployee + leaveDeductions;

  // Net Pay is Gross Salary minus Total Deductions
  const netPay = grossSalaryMonthly - totalDeduction;

  return (
    <div className="payslip-overlay">
      <div className="payslip-container">
        {/* Header */}
        <div className="payslip-header-new">
          <div className="company-logo-section">
            <div className="company-logo">
              <span className="logo-text">P</span>
            </div>
            <div className="company-details">
              <h2>Payflow</h2>
            </div>
          </div>
          <h1 className="payslip-title">PAYSLIP</h1>
        </div>

        {/* Employee Information Section */}
        <div className="employee-info-section">
          <div className="info-row">
            <span className="label">Employee Name:</span>
            <span className="value">{employeeData?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Month:</span>
            <span className="value">{formatMonthYear(payslipData?.month, payslipData?.year)}</span>
          </div>
        </div>

        {/* Earnings and Deductions Table */}
        <div className="payslip-details-table">
          <div className="table-column earnings-column">
            <div className="column-header">
              <h3>Earnings</h3>
              <div className="sub-headers">
                <span>Salary Head</span>
                <span>Amount</span>
              </div>
            </div>
            <div className="salary-items">
              <div className="salary-item">
                <span>Basic Salary</span>
                <span>{formatCurrency(basicSalaryMonthly)}</span>
              </div>
              <div className="salary-item">
                <span>HRA (House Rent Allowance)</span>
                <span>{formatCurrency(hraMonthly)}</span>
              </div>
              <div className="salary-item">
                <span>Allowances</span>
                <span>{formatCurrency(allowancesMonthly)}</span>
              </div>
              <div className="salary-item">
                <span>Bonuses</span>
                <span>{formatCurrency(bonusesMonthly)}</span>
              </div>
              <div className="salary-item">
                <span>PF Contribution (Employer)</span>
                <span>{formatCurrency(pfContributionMonthly)}</span>
              </div>
              <div className="salary-item">
                <span>Gratuity (Employer)</span>
                <span>{formatCurrency(gratuityMonthly)}</span>
              </div>
              <div className="salary-item total-row gross-salary">
                <span>GROSS SALARY</span>
                <span>{formatCurrency(grossSalaryMonthly)}</span>
              </div>
            </div>
          </div>

          <div className="table-column deductions-column">
            <div className="column-header">
              <h3>Deductions</h3>
              <div className="sub-headers">
                <span>Salary Head</span>
                <span>Amount</span>
              </div>
            </div>
            <div className="salary-items">
              <div className="salary-item">
                <span>PF Contribution (Employee)</span>
                <span>{formatCurrency(pfContributionEmployee)}</span>
              </div>
              <div className="salary-item">
                <span>Gratuity (Employee)</span>
                <span>{formatCurrency(gratuityEmployee)}</span>
              </div>
              <div className="salary-item">
                <span>Leave Deductions</span>
                <span>{formatCurrency(leaveDeductions)}</span>
              </div>
              <div className="salary-item total-row total-deduction">
                <span>Total Deduction</span>
                <span>{formatCurrency(totalDeduction)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Section */}
        <div className="net-pay-section">
          <div className="net-pay-item">
            <span className="label">NET PAY</span>
            <span className="value">{formatCurrency(netPay)}</span>
          </div>
          <p className="net-pay-note">(Gross Salary - Total Deductions = Net Pay)</p>
        </div>

        {/* Footer with Note */}
        <div className="payslip-footer-new">
          <div className="footer-note">
            This is a computer-generated payslip and does not require signatures.
          </div>
        </div>

        {/* Action Buttons */}
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