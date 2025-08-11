import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ModernDashboardStyles.css';

const Summary = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalLeaveRequests: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    rejectedLeaves: 0,
    unassignedEmployees: 0,
    totalManagers: 0
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isHR = location.pathname.includes('/hr/');
  const isManager = location.pathname.includes('/manager/');

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    setLoading(true);
    try {
      if (isManager) {
        // Manager Dashboard - Team and Leave focused data
        // Get manager ID from localStorage or session
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const managerId = user.id;

        if (!managerId) {
          console.error('No manager ID found');
          return;
        }

        // Fetch team members for this manager
        const employeesRes = await fetch(`http://localhost:8081/api/employees/manager/${managerId}`);
        const employeesData = await employeesRes.json();

        // Fetch leave requests for this manager's team
        const leaveRes = await fetch(`http://localhost:8081/api/leaves/manager/${managerId}`);
        const leaveData = await leaveRes.json();

        // Calculate manager-specific stats
        const activeEmployees = employeesData.filter(emp => emp.status && emp.status.toLowerCase() === 'active').length;
        const approvedLeaves = leaveData.filter(leave => leave.status === 'APPROVED').length;
        const pendingLeaves = leaveData.filter(leave => leave.status === 'PENDING').length;
        const rejectedLeaves = leaveData.filter(leave => leave.status === 'REJECTED').length;

        setStats({
          totalEmployees: employeesData.length,
          activeEmployees,
          totalLeaveRequests: leaveData.length,
          approvedLeaves,
          pendingLeaves,
          rejectedLeaves,
          teamSize: employeesData.length,
          totalLeaves: leaveData.length
        });
      } else if (isHR) {
        // HR Dashboard - Employee and Leave focused data
        const employeesRes = await fetch('http://localhost:8081/api/employees');
        const employeesData = await employeesRes.json();

        const leaveRes = await fetch('http://localhost:8081/api/leave-requests');
        const leaveData = await leaveRes.json();

        const usersRes = await fetch('http://localhost:8081/api/users');
        const usersData = await usersRes.json();

        // Calculate HR-specific stats
        const activeEmployees = employeesData.filter(emp => emp.status && emp.status.toLowerCase() === 'active').length;
        const unassignedEmployees = employeesData.filter(emp => !emp.managerId).length;
        const totalManagers = usersData.filter(u => u.role === 'MANAGER').length;

        const approvedLeaves = leaveData.filter(leave => leave.status === 'APPROVED').length;
        const pendingLeaves = leaveData.filter(leave => leave.status === 'PENDING').length;
        const rejectedLeaves = leaveData.filter(leave => leave.status === 'REJECTED').length;

        setStats({
          totalEmployees: employeesData.length,
          activeEmployees,
          totalLeaveRequests: leaveData.length,
          approvedLeaves,
          pendingLeaves,
          rejectedLeaves,
          unassignedEmployees,
          totalManagers
        });
      } else {
        // Admin Dashboard - User management focused data
        const usersRes = await fetch('http://localhost:8081/api/users');
        const usersData = await usersRes.json();
        const nonAdminUsers = usersData.filter(u => u.role !== 'ADMIN');

        const employeesRes = await fetch('http://localhost:8081/api/employees');
        const employeesData = await employeesRes.json();

        const activeUsers = nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'active').length;
        const disabledUsers = nonAdminUsers.filter(u => u.status && u.status.toLowerCase() === 'disabled').length;
        const totalHR = nonAdminUsers.filter(u => u.role === 'HR').length;
        const totalManagers = nonAdminUsers.filter(u => u.role === 'MANAGER').length;

        setStats({
          totalUsers: nonAdminUsers.length,
          totalHR,
          totalManagers,
          totalEmployees: employeesData.length,
          disabledUsers,
          activeUsers
        });
      }
    } catch (error) {
      console.error('Error loading summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages for pie chart based on role
  let chartData1, chartData2, total1, total2, chartTitle1, chartTitle2;

  if (isManager) {
    // Manager Dashboard charts
    chartData1 = [
      { label: 'Approved', value: stats.approvedLeaves, color: '#10b981' },
      { label: 'Pending', value: stats.pendingLeaves, color: '#f59e0b' },
      { label: 'Rejected', value: stats.rejectedLeaves, color: '#ef4444' }
    ];
    chartData2 = [
      { label: 'Active', value: stats.activeEmployees, color: '#10b981' },
      { label: 'Inactive', value: stats.totalEmployees - stats.activeEmployees, color: '#6b7280' }
    ];
    total1 = stats.totalLeaveRequests;
    total2 = stats.totalEmployees;
    chartTitle1 = 'Leave Request Status';
    chartTitle2 = 'Team Member Status';
  } else if (isHR) {
    // HR Dashboard charts
    chartData1 = [
      { label: 'Approved', value: stats.approvedLeaves, color: '#10b981' },
      { label: 'Pending', value: stats.pendingLeaves, color: '#f59e0b' },
      { label: 'Rejected', value: stats.rejectedLeaves, color: '#ef4444' }
    ];
    chartData2 = [
      { label: 'Active', value: stats.activeEmployees, color: '#10b981' },
      { label: 'Inactive', value: stats.totalEmployees - stats.activeEmployees, color: '#6b7280' }
    ];
    total1 = stats.totalLeaveRequests;
    total2 = stats.totalEmployees;
    chartTitle1 = 'Leave Request Status';
    chartTitle2 = 'Employee Status';
  } else {
    // Admin Dashboard charts
    chartData1 = [
      { label: 'HR', value: stats.totalHR, color: '#3b82f6' },
      { label: 'Managers', value: stats.totalManagers, color: '#8b5cf6' },
      { label: 'Employees', value: stats.totalEmployees, color: '#10b981' }
    ];
    chartData2 = [
      { label: 'Active', value: stats.activeUsers, color: '#10b981' },
      { label: 'Disabled', value: stats.disabledUsers, color: '#ef4444' }
    ];
    total1 = stats.totalUsers;
    total2 = stats.totalUsers;
    chartTitle1 = 'User Distribution';
    chartTitle2 = 'User Status';
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading summary data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          {isManager ? 'Team Summary & Analytics' :
           isHR ? 'HR Summary & Analytics' : 
           'Admin Summary & Analytics'}
        </h1>
        <p className="dashboard-subtitle">
          {isManager ? 'Team performance and leave management insights' :
           isHR ? 'Employee and leave management insights' : 
           'User management and system overview'}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="stats-grid admin-stats">
        {isManager ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalEmployees}</h3>
                <p>Team Size</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.activeEmployees}</h3>
                <p>Active Members</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.totalLeaveRequests}</h3>
                <p>Total Leave Requests</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pendingLeaves}</h3>
                <p>Pending Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.approvedLeaves}</h3>
                <p>Approved Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>{stats.rejectedLeaves}</h3>
                <p>Rejected Leaves</p>
              </div>
            </div>
          </>
        ) : isHR ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalEmployees}</h3>
                <p>Total Employees</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.activeEmployees}</h3>
                <p>Active Employees</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.totalLeaveRequests}</h3>
                <p>Leave Requests</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-content">
                <h3>{stats.totalManagers}</h3>
                <p>Total Managers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pendingLeaves}</h3>
                <p>Pending Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-content">
                <h3>{stats.unassignedEmployees}</h3>
                <p>Unassigned Employees</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.activeUsers}</h3>
                <p>Active Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-content">
                <h3>{stats.totalHR}</h3>
                <p>HR Personnel</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-content">
                <h3>{stats.totalManagers}</h3>
                <p>Managers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalEmployees}</h3>
                <p>Employees</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>{stats.disabledUsers}</h3>
                <p>Disabled Users</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* First Chart */}
          <div className="chart-card">
            <h3>{chartTitle1}</h3>
            <div className="pie-chart">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {chartData1.map((item, index) => {
                  const percentage = total1 > 0 ? (item.value / total1) * 100 : 0;
                  const startAngle = chartData1
                    .slice(0, index)
                    .reduce((sum, d) => sum + (d.value / total1) * 360, 0);
                  const endAngle = startAngle + (item.value / total1) * 360;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={item.label}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="chart-legend">
              {chartData1.map(item => (
                <div key={item.label} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Chart */}
          <div className="chart-card">
            <h3>{chartTitle2}</h3>
            <div className="pie-chart">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {chartData2.map((item, index) => {
                  const percentage = total2 > 0 ? (item.value / total2) * 100 : 0;
                  const startAngle = chartData2
                    .slice(0, index)
                    .reduce((sum, d) => sum + (d.value / total2) * 360, 0);
                  const endAngle = startAngle + (item.value / total2) * 360;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={item.label}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="chart-legend">
              {chartData2.map(item => (
                <div key={item.label} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card full-width">
          <h3>{isHR ? 'Leave Request Overview' : 'User Statistics Overview'}</h3>
          <div className="bar-chart">
            <div className="bar-chart-container">
              {isHR ? (
                <>
                  <div className="bar-group">
                    <div className="bar-label">Approved</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${stats.totalLeaveRequests > 0 ? (stats.approvedLeaves / stats.totalLeaveRequests) * 100 : 0}%`,
                          backgroundColor: '#10b981'
                        }}
                      >
                        <span className="bar-value">{stats.approvedLeaves}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label">Pending</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${stats.totalLeaveRequests > 0 ? (stats.pendingLeaves / stats.totalLeaveRequests) * 100 : 0}%`,
                          backgroundColor: '#f59e0b'
                        }}
                      >
                        <span className="bar-value">{stats.pendingLeaves}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label">Rejected</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${stats.totalLeaveRequests > 0 ? (stats.rejectedLeaves / stats.totalLeaveRequests) * 100 : 0}%`,
                          backgroundColor: '#ef4444'
                        }}
                      >
                        <span className="bar-value">{stats.rejectedLeaves}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {chartData1.map((item, index) => {
                    // Calculate the maximum value for proper scaling
                    const maxValue = Math.max(...chartData1.map(d => d.value));
                    // Calculate height percentage based on the value relative to max
                    const heightPercentage = (item.value / maxValue) * 100;
                    
                    return (
                      <div key={index} className="bar-group">
                        <div className="bar-label">{item.label}</div>
                        <div className="bar-container">
                          <div 
                            className="bar" 
                            style={{ 
                              height: `${heightPercentage}%`,
                              width: '40px',
                              backgroundColor: item.color
                            }}
                          >
                            <span className="bar-value">{item.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          {isHR ? (
            <>
              <div className="insight-card">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                  <h4>Leave Approval Rate</h4>
                  <p>
                    {stats.totalLeaveRequests > 0 
                      ? `${Math.round((stats.approvedLeaves / stats.totalLeaveRequests) * 100)}%` 
                      : '0%'} of leave requests are approved
                  </p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">👥</div>
                <div className="insight-content">
                  <h4>Employee Management</h4>
                  <p>
                    {stats.unassignedEmployees} employees ({stats.totalEmployees > 0 ? Math.round((stats.unassignedEmployees / stats.totalEmployees) * 100) : 0}%) 
                    are not assigned to managers
                  </p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">⏰</div>
                <div className="insight-content">
                  <h4>Pending Actions</h4>
                  <p>
                    {stats.pendingLeaves} leave requests require immediate attention and approval
                  </p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>Active Workforce</h4>
                  <p>
                    {stats.activeEmployees} out of {stats.totalEmployees} employees ({stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}%) 
                    are currently active
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>User Growth</h4>
                  <p>Total user base of {stats.totalUsers} with {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active rate</p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">👥</div>
                <div className="insight-content">
                  <h4>Role Distribution</h4>
                  <p>{stats.totalHR} HR personnel and {stats.totalManagers} managers managing {stats.totalEmployees} employees</p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <h4>System Health</h4>
                  <p>{stats.disabledUsers} users are currently disabled, requiring attention</p>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                  <h4>Management Overview</h4>
                  <p>System has {stats.totalManagers} managers and {stats.totalHR} HR personnel for optimal user management</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;