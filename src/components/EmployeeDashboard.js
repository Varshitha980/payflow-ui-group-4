import React, { useState, useEffect, useRef } from 'react';

const LEAVES_PER_PAGE = 10;

const EmployeeDashboard = ({ employeeId, employeeName, onLogout }) => {
  const [leaveBalance, setLeaveBalance] = useState(12);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState('dashboard');
  const applyLeaveRef = useRef(null);

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/employees/${employeeId}`);
      const data = await res.json();
      setLeaveBalance(data.leaves || 12);
    } catch (e) {
      setLeaveBalance(12);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/leaves?employeeId=${employeeId}`);
      const data = await res.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setLeaveRequests([]);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        status: 'PENDING'
      };
      const res = await fetch('http://localhost:8080/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg('Leave request submitted!');
        setForm({ startDate: '', endDate: '', reason: '' });
        // Optimistically add the new leave to the top of the list
        setLeaveRequests(prev => [{
          id: Date.now(), // temp id
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
          status: 'PENDING'
        }, ...prev]);
        // Optionally, you can still refetch from backend after a short delay
        setTimeout(fetchLeaveRequests, 1000);
      } else {
        setMsg('Failed to submit leave request.');
      }
    } catch (e) {
      setMsg('Failed to submit leave request.');
    }
  };

  // Scroll to Apply Leave form when nav is clicked
  const handleNavClick = (nav) => {
    setActiveNav(nav);
    if (nav === 'apply') {
      setTimeout(() => {
        applyLeaveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Pagination
  const totalPages = Math.ceil(leaveRequests.length / LEAVES_PER_PAGE) || 1;
  const paginatedLeaves = leaveRequests.slice((page - 1) * LEAVES_PER_PAGE, page * LEAVES_PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)', display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar */}
      <nav style={{
        width: 240,
        minHeight: '100vh',
        backgroundColor: '#2c3e50',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 0
      }}>
        <div className="sidebar-header" style={{ padding: '32px 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 24 }}>
            <span className="user-avatar" style={{ background: '#fff', color: '#2c3e50', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>{employeeName ? employeeName[0] : 'E'}</span>
            <div className="user-details">
              <div className="user-name" style={{ fontWeight: 600, fontSize: 18 }}>{employeeName}</div>
              <div className="user-role" style={{ fontSize: 13, opacity: 0.7 }}>Employee</div>
            </div>
          </div>
        </div>
        <ul className="nav-list sidebar-nav" style={{ marginTop: 24, flex: 1 }}>
          <li className={`nav-item${activeNav === 'dashboard' ? ' active' : ''}`}
              onClick={() => handleNavClick('dashboard')}>
            <a className="nav-link"><span className="nav-icon">🏠</span>Dashboard</a>
          </li>
          <li className={`nav-item${activeNav === 'apply' ? ' active' : ''}`}
              onClick={() => handleNavClick('apply')}>
            <a className="nav-link"><span className="nav-icon">📝</span>Apply Leave</a>
          </li>
        </ul>
      </nav>
      {/* Main Content */}
      <div className="content" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 0', position: 'relative' }}>
        {/* Small Logout button top right */}
        <button
          style={{
            position: 'absolute',
            top: 24,
            right: 32,
            background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            padding: 0
          }}
          onClick={() => onLogout && onLogout()}
          title="Logout"
        >
          <span role="img" aria-label="logout">🚪</span>
        </button>
        <div style={{ width: '100%', maxWidth: 900 }}>
          <div className="dashboard-header" style={{ marginBottom: 24, textAlign: 'center' }}>
            <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>Welcome, {employeeName || 'Employee'}</h1>
            <p style={{ color: '#6c757d', marginTop: 8 }}>Your Employee Dashboard</p>
          </div>
          {/* Stats */}
          <div className="section-card" style={{ maxWidth: 500, width: '100%', margin: '0 auto 32px auto', boxShadow: '0 4px 24px rgba(44,62,80,0.07)', borderRadius: 16, padding: 32, background: '#fff', textAlign: 'center' }}>
            <div className="stats-grid" style={{ justifyContent: 'center' }}>
              <div className="stat-card" style={{ minWidth: 180, background: 'linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%)', color: '#2c3e50', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', margin: '0 auto' }}>
                <div className="stat-icon" style={{ fontSize: 32 }}>🌴</div>
                <div className="stat-content">
                  <h3 style={{ fontSize: 36, margin: 0 }}>{leaveBalance}</h3>
                  <p style={{ margin: 0, fontWeight: 500 }}>Leave Balance</p>
                </div>
              </div>
            </div>
          </div>
          {/* Apply Leave Form */}
          <div ref={applyLeaveRef} className="section-card" style={{ maxWidth: 600, width: '100%', margin: '0 auto 32px auto', boxShadow: '0 4px 24px rgba(44,62,80,0.07)', borderRadius: 16, padding: 32, background: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Apply for Leave</h2>
            {msg && <div className="alert alert-success">{msg}</div>}
            <form onSubmit={handleApply} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
                style={{ minWidth: 140 }}
              />
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                required
                style={{ minWidth: 140 }}
              />
              <input
                type="text"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Reason"
                required
                style={{ minWidth: 200 }}
              />
              <button type="submit" className="btn-primary" style={{ minWidth: 120 }}>Apply</button>
            </form>
          </div>
          {/* Leave History Table */}
          <div className="section-card" style={{ maxWidth: 900, width: '100%', margin: '0 auto', boxShadow: '0 4px 24px rgba(44,62,80,0.07)', borderRadius: 16, padding: 32, background: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Leave History</h2>
            <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '20px', margin: '0 auto' }}>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>No leave requests found.</td></tr>
                  ) : (
                    paginatedLeaves.map(lr => (
                      <tr key={lr.id}>
                        <td>{lr.startDate}</td>
                        <td>{lr.endDate}</td>
                        <td>{lr.reason}</td>
                        <td>
                          <span className={`status-badge ${lr.status ? lr.status.toLowerCase() : ''}`}>{lr.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, fontSize: '14px', width: '100%' }}>
                <button onClick={() => setPage(prev => Math.max(1, prev - 1))} style={{ fontSize: '12px', padding: '2px 8px', width: '2.5cm' }}>&lt;</button>
                <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} style={{ fontSize: '12px', padding: '2px 8px', width: '2.5cm' }}>&gt;</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
