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
        { path: '/admin/users-list', icon: '👥', label: 'Manage Users', sublabel: 'HR & Managers' },
        { path: '/admin/reports', icon: '📊', label: 'Reports', sublabel: 'Analytics' },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings', sublabel: 'System Config' }
      ];
    } else if (user?.role === 'HR') {
      return [
        { path: '/hr', icon: '🏠', label: 'Dashboard', sublabel: 'Home' },
        { path: '/hr/employees', icon: '👥', label: 'Employees', sublabel: 'Manage Staff' },
        { path: '/hr/onboarding', icon: '🆕', label: 'Onboarding', sublabel: 'New Hires' },
        { path: '/hr/reports', icon: '📊', label: 'Reports', sublabel: 'HR Analytics' }
      ];
    } else if (user?.role === 'MANAGER') {
      return [
        { path: '/manager', icon: '🏠', label: 'Dashboard', sublabel: 'Home' },
        { path: '/manager/team', icon: '👥', label: 'My Team', sublabel: 'Team Members' },
        { path: '/manager/projects', icon: '📋', label: 'Projects', sublabel: 'Task Management' },
        { path: '/manager/reports', icon: '📊', label: 'Reports', sublabel: 'Team Analytics' }
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
        <div className="user-info">
          <div className="user-avatar">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || user?.username || 'User'}&background=007bff&color=fff&size=32`} 
              alt="User" 
            />
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || user?.username || 'User'}</div>
            <div className="user-role">{user?.role || 'User'}</div>
          </div>
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
            <button className="quick-action-btn">
              <span>🔐</span>
              <span>Create User</span>
            </button>
          )}
          {user?.role === 'HR' && (
            <>
              <button className="quick-action-btn">
                <span>➕</span>
                <span>Add Employee</span>
              </button>
              <button className="quick-action-btn">
                <span>📥</span>
                <span>Import CSV</span>
              </button>
            </>
          )}
          {user?.role === 'MANAGER' && (
            <button className="quick-action-btn">
              <span>📋</span>
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
