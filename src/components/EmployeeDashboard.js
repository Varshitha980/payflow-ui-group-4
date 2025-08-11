import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ModernDashboardStyles.css';

const LEAVES_PER_PAGE = 10;

const statusColors = {
  PENDING: '#ffc107',
  APPROVED: '#28a745',
  REJECTED: '#dc3545',
};
const statusIcons = {
  PENDING: '⏳',
  APPROVED: '✅',
  REJECTED: '❌',
};
const statusText = {
  PENDING: 'Awaiting Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const EmployeeDashboard = ({ employeeId, employeeName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leaveBalance, setLeaveBalance] = useState(12);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const applyLeaveRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'overview';
    setActiveTab(initialTab);
    fetchLeaveBalance();
    fetchLeaveRequests();
  }, [location.search]);

  const fetchLeaveBalance = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/employees/${employeeId}`);
      const data = await res.json();
      setLeaveBalance(data.leaves || 12);
    } catch (e) {
      setLeaveBalance(12);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/leaves?employeeId=${employeeId}`);
      const data = await res.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setLeaveRequests([]);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const requestDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const hasDuplicate = leaveRequests.some(lr => {
      const existingStart = new Date(lr.startDate);
      const existingEnd = new Date(lr.endDate);

      const overlaps = (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      );

      return overlaps && (lr.status === 'PENDING' || lr.status === 'APPROVED');
    });

    if (hasDuplicate) {
      setMsg('❌ You have already applied for leave during this period. Please check your leave history.');
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    const approvedLeaveDays = leaveRequests
      .filter(lr => lr.status === 'APPROVED')
      .reduce((total, lr) => total + (lr.days || Math.ceil((new Date(lr.endDate) - new Date(lr.startDate)) / (1000 * 60 * 60 * 24)) + 1), 0);

    const actualRemainingLeaves = leaveBalance - approvedLeaveDays;

    if (actualRemainingLeaves < requestDays) {
      const excessDays = requestDays - actualRemainingLeaves;
      const confirmApply = window.confirm(
        `⚠️  Warning: You only have ${actualRemainingLeaves < 0 ? 0 : actualRemainingLeaves} days of leave balance remaining, but you're requesting ${requestDays} days.\n\n` +
        `This will result in ${excessDays} day(s) of salary deduction.\n\n` +
        `Do you want to proceed with the leave application?`
      );

      if (!confirmApply) {
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        employeeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        status: 'PENDING',
      };
      const res = await fetch('http://localhost:8081/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg('🎉 Leave request submitted! You will receive an email when your manager reviews it.');
        setForm({ startDate: '', endDate: '', reason: '' });
        setTimeout(() => setMsg(''), 2500);
        setTimeout(fetchLeaveRequests, 1000);
      } else {
        setMsg('Failed to submit leave request.');
        setTimeout(() => setMsg(''), 2500);
      }
    } catch (e) {
      setMsg('Failed to submit leave request.');
      setTimeout(() => setMsg(''), 2500);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(leaveRequests.length / LEAVES_PER_PAGE) || 1;
  const paginatedLeaves = leaveRequests.slice((page - 1) * LEAVES_PER_PAGE, page * LEAVES_PER_PAGE);

  const totalLeaves = leaveBalance;
  const usedLeaves = leaveRequests
    .filter(lr => lr.status === 'APPROVED')
    .reduce((total, lr) => {
      const startDate = new Date(lr.startDate);
      const endDate = new Date(lr.endDate);
      const duration = lr.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      return total + duration;
    }, 0);
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'PENDING').length;
  const actualRemainingLeaves = totalLeaves - usedLeaves;
  const remainingLeaves = actualRemainingLeaves < 0 ? 0 : actualRemainingLeaves;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard-container">
      {/* Left Navigation Bar (New) */}
      <div className="left-navbar">
        <div className="user-profile">
          <div className="avatar">{employeeName ? employeeName[0].toUpperCase() : 'E'}</div>
          <div className="user-info">
            <div className="user-name">{employeeName || 'Employee'}</div>
            <div className="user-role">Employee</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          >
            Leave History
          </button>
          <button 
            onClick={() => setActiveTab('apply')} 
            className={`nav-item ${activeTab === 'apply' ? 'active' : ''}`}
          >
            Apply Leave
          </button>
          <button 
            onClick={() => setActiveTab('payslips')} 
            className={`nav-item ${activeTab === 'payslips' ? 'active' : ''}`}
          >
            Payslips
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Main Content Area (New) */}
      <div className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === 'overview' && `Welcome ${employeeName || 'Employee'}`}
            {activeTab === 'history' && 'Leave History'}
            {activeTab === 'apply' && 'Apply Leave'}
            {activeTab === 'payslips' && 'Payslips'}
          </h1>
          <p className="dashboard-subtitle">
            {activeTab === 'overview' && 'Overview of your leave statistics and recent activity'}
            {activeTab === 'history' && 'View and track all your leave requests'}
            {activeTab === 'apply' && 'Submit a new leave request'}
            {activeTab === 'payslips' && 'Access your salary and payment information'}
          </p>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('🎉') ? 'alert-success' : 'alert-error'}`}>
            {msg}
            <button onClick={() => setMsg('')} className="alert-close">×</button>
          </div>
        )}

        {/* Existing content for each tab is placed here */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className={`stat-card ${usedLeaves >= totalLeaves ? 'danger-card' : ''}`}>
                <div className="stat-icon">{usedLeaves >= totalLeaves ? '🚫' : '🌴'}</div>
                <div className="stat-content">
                  <h3>{usedLeaves}</h3>
                  <p>{usedLeaves >= totalLeaves ? 'All Leaves Used' : 'Leaves Used'}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{remainingLeaves}</h3>
                  <p>Remaining Leaves</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{pendingLeaves}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{totalLeaves}</h3>
                  <p>Total Leaves</p>
                </div>
              </div>
            </div>

            <div className="table-section">
              <h2>Recent Activity</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <h3>{leaveRequests.length}</h3>
                    <p>Total Requests</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>{leaveRequests.filter(lr => lr.status === 'APPROVED').length}</h3>
                    <p>Approved</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❌</div>
                  <div className="stat-content">
                    <h3>{leaveRequests.filter(lr => lr.status === 'REJECTED').length}</h3>
                    <p>Rejected</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="table-section">
            <h2>Your Leave History</h2>
            
            {leaveRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No leave requests yet</h3>
                <p>Apply for your first leave request using the "Apply Leave" tab above!</p>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeaves.map(lr => {
                        const startDate = new Date(lr.startDate);
                        const endDate = new Date(lr.endDate);
                        const duration = lr.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                        return (
                          <tr key={lr.id}>
                            <td>{new Date(lr.startDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</td>
                            <td>{new Date(lr.endDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</td>
                            <td>
                              <span className="status-badge">
                                {duration} day{duration > 1 ? 's' : ''}
                              </span>
                            </td>
                            <td>{lr.reason}</td>
                            <td>
                              <span className={`status-badge ${lr.status.toLowerCase()}`}>
                                {statusIcons[lr.status]} {statusText[lr.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      ‹ 
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                    >
                       ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'apply' && (
          <div ref={applyLeaveRef} className="table-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Apply for Leave</h2>

            {actualRemainingLeaves <= 0 && (
              <div className="alert alert-warning">
                ⚠️ You have no remaining leaves. Applying for leave will result in a salary deduction.
              </div>
            )}

            <form onSubmit={handleApply} className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Leave</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Please provide a detailed reason for your leave request..."
                  required
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary full-width"
                disabled={loading}
              >
                {loading ? 'Submitting...' : remainingLeaves <= 0 ? 'Apply with Salary Deduction' : 'Submit Leave Request'} {loading && '⏳'}
              </button>
            </form>

            <div className="info-box">
              <p>
                💡 <strong>Tip:</strong> Your leave request will be reviewed by your manager. 
                You'll receive an email notification once it's approved or rejected.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="table-section">
            <h2>Payslips & Salary Information</h2>
            
            <div className="content-card">
              <div className="card-icon">📄</div>
              <h3>View Your Payslips & CTC Details</h3>
              <p>Access your complete salary information, download payslips, and view your CTC breakdown</p>
              <button
                onClick={() => navigate('/employee/payslips')}
                className="btn-primary"
              >
                View Payslips & CTC
              </button>
            </div>
            
            <div className="info-box">
              <h3>What you can do:</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <div className="feature-content">
                    <div>View CTC</div>
                    <div>Salary breakdown</div>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📄</span>
                  <div className="feature-content">
                    <div>Download Payslips</div>
                    <div>Monthly statements</div>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <div className="feature-content">
                    <div>Track History</div>
                    <div>Payment records</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;