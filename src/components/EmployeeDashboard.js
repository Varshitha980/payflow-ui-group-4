import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployeeForm.css';

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
    
    // Calculate days for this request
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const requestDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check for duplicate leave applications
    const hasDuplicate = leaveRequests.some(lr => {
      const existingStart = new Date(lr.startDate);
      const existingEnd = new Date(lr.endDate);
      
      // Check if the new request overlaps with any existing request
      const overlaps = (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      );
      
      return overlaps && (lr.status === 'PENDING' || lr.status === 'APPROVED');
    });
    
    if (hasDuplicate) {
      setMsg('❌ You have already applied for leave during this period. Please check your leave history.');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    
    // Show warning if applying with insufficient leave balance
    if (remainingLeaves < requestDays) {
      const excessDays = requestDays - remainingLeaves;
      const confirmApply = window.confirm(
        `⚠️  Warning: You only have ${remainingLeaves} days of leave balance remaining, but you're requesting ${requestDays} days.\n\n` +
        `This will result in ${excessDays} day(s) of salary deduction.\n\n` +
        `Do you want to proceed with the leave application?`
      );
      
      if (!confirmApply) {
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
    }
  };

  const totalPages = Math.ceil(leaveRequests.length / LEAVES_PER_PAGE) || 1;
  const paginatedLeaves = leaveRequests.slice((page - 1) * LEAVES_PER_PAGE, page * LEAVES_PER_PAGE);

  const totalLeaves = leaveBalance; // Use the leave balance from database
  // Calculate used leaves based on actual days
  const usedLeaves = leaveRequests
    .filter(lr => lr.status === 'APPROVED')
    .reduce((total, lr) => total + (lr.days || 1), 0); // Use days field, fallback to 1
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'PENDING').length;
  const remainingLeaves = totalLeaves - usedLeaves;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex'
    }}>
      <nav style={{
        width: '280px',
        background: 'linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '0 24px 24px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {employeeName ? employeeName[0].toUpperCase() : 'E'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>{employeeName || 'Employee'}</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Employee</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'overview' ? 'rgba(255,255,255,0.2)' : 'transparent',
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

          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'history' ? 'rgba(255,255,255,0.2)' : 'transparent',
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
              <span style={{ fontSize: '18px' }}>📋</span>
              Leave History
            </button>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('apply')}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'apply' ? 'rgba(255,255,255,0.2)' : 'transparent',
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
              <span style={{ fontSize: '18px' }}>📝</span>
              Apply Leave
            </button>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('payslips')}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'payslips' ? 'rgba(255,255,255,0.2)' : 'transparent',
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
              <span style={{ fontSize: '18px' }}>💰</span>
              Payslips
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => onLogout && onLogout()}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {activeTab === 'overview' && (
              <button
                onClick={() => navigate('/')}
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
                ← Back to Home
              </button>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                {activeTab === 'overview' && `Welcome ${employeeName || 'Employee'}`}
                {activeTab === 'history' && '📋 Leave History'}
                {activeTab === 'apply' && '📝 Apply Leave'}
                {activeTab === 'payslips' && '💰 Payslips'}
              </h1>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {activeTab === 'overview' && 'Overview of your leave statistics and recent activity'}
                {activeTab === 'history' && 'View and track all your leave requests'}
                {activeTab === 'apply' && 'Submit a new leave request'}
                {activeTab === 'payslips' && 'Access your salary and payment information'}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            opacity: 0.9
          }}>
            <span>👤</span>
            {employeeName || 'Employee'}
          </div>
        </header>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}>
                <div style={{
                  background: usedLeaves >= totalLeaves 
                    ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' 
                    : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  color: usedLeaves >= totalLeaves ? '#dc2626' : '#3730a3',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: usedLeaves >= totalLeaves 
                    ? '0 4px 20px rgba(220, 38, 38, 0.15)' 
                    : '0 4px 20px rgba(99, 102, 241, 0.15)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                    {usedLeaves >= totalLeaves ? '🚫' : '🌴'}
                  </div>
                  <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>
                    {usedLeaves}
                  </h3>
                  <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>
                    {usedLeaves >= totalLeaves ? 'All Leaves Used' : 'Leaves Used'}
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  color: '#be185d',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(236, 72, 153, 0.15)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
                  <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>{remainingLeaves}</h3>
                  <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Remaining Leaves</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  color: '#1d4ed8',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
                  <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>{pendingLeaves}</h3>
                  <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Pending Requests</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  color: '#166534',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                  <h3 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>{totalLeaves}</h3>
                  <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Total Leaves</p>
                </div>

                {remainingLeaves < 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    color: '#d97706',
                    padding: '30px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
                    transition: 'transform 0.3s ease',
                    gridColumn: 'span 2'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                    <h3 style={{ fontSize: '24px', margin: '0 0 10px 0', fontWeight: '700' }}>
                      Salary Deduction Alert
                    </h3>
                    <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>
                      You have exceeded your leave balance by {Math.abs(remainingLeaves)} days. 
                      Salary will be deducted for excess leaves.
                    </p>
                  </div>
                )}
              </div>

              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  📈 Recent Activity
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📋</span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Total Requests</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>
                      {leaveRequests.length}
                    </div>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Approved</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                      {leaveRequests.filter(lr => lr.status === 'APPROVED').length}
                    </div>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>❌</span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Rejected</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
                      {leaveRequests.filter(lr => lr.status === 'REJECTED').length}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '24px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                📋 Your Leave History
              </h2>
              
              {leaveRequests.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>No leave requests yet</h3>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    Apply for your first leave request using the "Apply Leave" tab above!
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    borderRadius: '15px',
                    border: '1px solid #e1e5e9'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '16px'
                    }}>
                      <thead style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        position: 'sticky',
                        top: 0
                      }}>
                        <tr>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>From</th>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>To</th>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Duration</th>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Reason</th>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                          <th style={{ padding: '20px 15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLeaves.map(lr => {
                          const startDate = new Date(lr.startDate);
                          const endDate = new Date(lr.endDate);
                          const duration = lr.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                          return (
                            <tr key={lr.id} style={{
                              borderBottom: '1px solid #f1f3f4',
                              transition: 'background 0.2s'
                            }}>
                              <td style={{ padding: '20px 15px', fontWeight: '500' }}>
                                {new Date(lr.startDate).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </td>
                              <td style={{ padding: '20px 15px', fontWeight: '500' }}>
                                {new Date(lr.endDate).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </td>
                              <td style={{ padding: '20px 15px' }}>
                                <span style={{
                                  background: '#e3f2fd',
                                  color: '#1976d2',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}>
                                  {duration} day{duration > 1 ? 's' : ''}
                                </span>
                              </td>
                              <td style={{ padding: '20px 15px', maxWidth: '200px', wordWrap: 'break-word' }}>
                                {lr.reason}
                              </td>
                              <td style={{ padding: '20px 15px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  borderRadius: '25px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  backgroundColor: statusColors[lr.status] + '20',
                                  color: statusColors[lr.status],
                                  border: `2px solid ${statusColors[lr.status]}`,
                                  minWidth: '140px',
                                  justifyContent: 'center'
                                }}>
                                  <span>{statusIcons[lr.status]}</span>
                                  {statusText[lr.status]}
                                </span>
                              </td>
                              <td style={{ padding: '20px 15px' }}>
                                {lr.status === 'APPROVED' && lr.salaryDeducted ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: '#fef3c7',
                                    color: '#d97706',
                                    border: '1px solid #fbbf24'
                                  }}>
                                    <span>⚠️</span>
                                    Deducted
                                  </span>
                                ) : lr.status === 'APPROVED' ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #bbf7d0'
                                  }}>
                                    <span>✅</span>
                                    Normal
                                  </span>
                                ) : (
                                  <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db'
                                  }}>
                                    -
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: '30px',
                      gap: '15px'
                    }}>
                      <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '25px',
                          background: page === 1 ? '#e9ecef' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: page === 1 ? '#999' : 'white',
                          border: 'none',
                          cursor: page === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '25px',
                          background: page === totalPages ? '#e9ecef' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: page === totalPages ? '#999' : 'white',
                          border: 'none',
                          cursor: page === totalPages ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'apply' && (
            <div ref={applyLeaveRef} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h2 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '24px', 
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center'
              }}>
                📝 Apply for Leave
              </h2>

              {msg && (
                <div style={{
                  background: msg.includes('🎉') ? '#d1fae5' : '#fee2e2',
                  color: msg.includes('🎉') ? '#065f46' : '#991b1b',
                  border: `1px solid ${msg.includes('🎉') ? '#a7f3d0' : '#fecaca'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {msg}
                </div>
              )}

              {remainingLeaves <= 0 && (
                <div style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  ⚠️ You have no remaining leaves. Applying for leave will result in a salary deduction.
                </div>
              )}

              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontWeight: '600', 
                      marginBottom: '8px', 
                      color: '#333',
                      fontSize: '16px'
                    }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid #e1e5e9',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontWeight: '600', 
                      marginBottom: '8px', 
                      color: '#333',
                      fontSize: '16px'
                    }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid #e1e5e9',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: '600', 
                    marginBottom: '8px', 
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    Reason for Leave
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    placeholder="Please provide a detailed reason for your leave request..."
                    required
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '2px solid #e1e5e9',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '18px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '10px'
                  }}
                >
                  <span>🛫</span>
                  {remainingLeaves <= 0 ? 'Apply with Salary Deduction' : 'Submit Leave Request'}
                </button>
              </form>

              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  💡 <strong>Tip:</strong> Your leave request will be reviewed by your manager. 
                  You'll receive an email notification once it's approved or rejected.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'payslips' && (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '24px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                💰 Payslips & Salary Information
              </h2>
              
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '24px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <h3 style={{ 
                  fontSize: '20px', 
                  margin: '0 0 12px 0', 
                  fontWeight: '600',
                  color: '#0c4a6e'
                }}>
                  View Your Payslips & CTC Details
                </h3>
                <p style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '16px', 
                  color: '#0369a1',
                  lineHeight: '1.5'
                }}>
                  Access your complete salary information, download payslips, and view your CTC breakdown
                </p>
                <button
                  onClick={() => navigate('/employee/payslips')}
                  style={{
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#0284c7';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#0ea5e9';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  View Payslips & CTC
                </button>
              </div>
              
              <div style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  💡 What you can do:
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '20px' }}>💰</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>View CTC</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Salary breakdown</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '20px' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>Download Payslips</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Monthly statements</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>Track History</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Payment records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 