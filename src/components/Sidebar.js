import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { path: '/admin', icon: '🏠', label: 'Dashboard', sublabel: 'Home' },
        { path: '/admin/manage-users', icon: '👥', label: 'Manage Users', sublabel: 'HR & Managers' },
        { path: '/admin/summary', icon: '📈', label: 'Summary', sublabel: 'Analytics & Charts' },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings', sublabel: 'System Config' }
      ];
    } else if (user?.role === 'HR') {
      return [
        { path: '/hr', icon: '🏠', label: 'Dashboard', sublabel: 'Home' },
        { path: '/hr/employees', icon: '👥', label: 'All Employees', sublabel: 'Employee List' },
        { path: '/hr/ctc', icon: '💰', label: 'CTC Management', sublabel: 'Salary Structure' },
        { path: '/hr/payslips', icon: '📄', label: 'Payslip Management', sublabel: 'Generate Payslips' },
        { path: '/hr/summary', icon: '📈', label: 'Summary', sublabel: 'Analytics & Charts' }
      ];
    } else if (user?.role === 'MANAGER') {
      return [
        { path: '/manager', icon: '🏠', label: 'Dashboard', sublabel: 'Home' },
        { path: '/manager/team', icon: '👥', label: 'My Team', sublabel: 'Team Members' },
        { path: '/manager/leaves', icon: '📝', label: 'Leave Requests', sublabel: 'Requests' },
        { path: '/manager/summary', icon: '📊', label: 'Summary', sublabel: 'Team Analytics' }
      ];
    }
    return [];
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">PayFlow</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {getNavItems().map((item, index) => (
            <li key={index} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-sublabel">{item.sublabel}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="quick-actions">
          <h4>Quick Actions</h4>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/manage-users" className="quick-action-btn">
              <span>🔐</span>
              <span>Create User</span>
            </Link>
          )}

          {user?.role === 'MANAGER' && (
            <button className="quick-action-btn">
              <span>👥</span>
              <span>View Team</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
