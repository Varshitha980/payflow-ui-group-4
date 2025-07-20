import React, { useState, useEffect } from 'react';
import '../App.css';

const Topbar = ({ onLogout, user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">PayFlow Admin</span>
        </div>
      </div>
      
      <div className="topbar-center">
        <div className="welcome-message">
          👋 Welcome, {user?.name || user?.username || 'Admin'}!
        </div>
      </div>

      <div className="topbar-right">
        <div className="clock-widget">
          <span className="clock-icon">🕒</span>
          <span className="clock-time">{formatTime(currentTime)}</span>
        </div>
        
        <div className="notifications">
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="profile-section">
          <div 
            className="profile-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || user?.username || 'Admin'}&background=007bff&color=fff&size=40`} 
              alt="Profile" 
              className="avatar-img"
            />
            <span className="profile-name">{user?.name || user?.username || 'Admin'}</span>
            <span className="profile-role">{user?.role || 'Admin'}</span>
          </div>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-item">
                <span>👤</span>
                <span>Profile</span>
              </div>
              <div className="profile-menu-item">
                <span>⚙️</span>
                <span>Settings</span>
              </div>
              <div className="profile-menu-divider"></div>
              <div className="profile-menu-item" onClick={onLogout}>
                <span>🚪</span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
