// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../App.css';

const Layout = ({ children, onLogout, user }) => {
  return (
    <div className="layout">
      <Topbar onLogout={onLogout} user={user} />
      <div className="main">
        <Sidebar user={user} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
