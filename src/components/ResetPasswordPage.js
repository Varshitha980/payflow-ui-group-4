import React, { useState, useEffect } from 'react';
import API from '../api';
import ManagerSelectionPage from './ManagerSelectionPage';

const ResetPasswordPage = ({ id, username, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showManagerSelection, setShowManagerSelection] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  
  console.log("ResetPasswordPage received id:", id, "username:", username);

  // Check if employee needs manager selection
  useEffect(() => {
    if (id) {
      checkEmployeeManagerStatus();
    }
  }, [id]);

  const checkEmployeeManagerStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/employees/${id}`);
      const data = await response.json();
      setEmployeeData(data);
      
      // If employee has no manager assigned, they'll need to select one
      if (!data.managerId) {
        setShowManagerSelection(true);
      }
    } catch (error) {
      console.error('Error checking employee status:', error);
    }
  };

  const handleReset = async () => {
    try {
      let endpoint, payload;
      
      if (id) {
        // Employee password reset
        endpoint = '/employees/reset-password';
        payload = { id, newPassword };
        console.log('Employee reset password URL:', endpoint);
        console.log('Employee reset payload:', payload);
      } else if (username) {
        // User (Manager/HR) password reset
        endpoint = '/users/reset-password';
        payload = { username, newPassword };
        console.log('User reset password URL:', endpoint);
        console.log('User reset payload:', payload);
      } else {
        throw new Error('Neither id nor username provided');
      }
      
      await API.post(endpoint, payload);
      setDone(true);
      
      // For employees, check if they need manager selection
      if (id && showManagerSelection) {
        // Don't call onReset yet, show manager selection instead
        return;
      }
      
      onReset();
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrorMsg(error?.response?.data || 'Failed to reset password.');
    }
  };

  const handleManagerSelectionComplete = () => {
    onReset();
  };

  // If employee needs manager selection, show that instead
  if (showManagerSelection && done) {
    return (
      <ManagerSelectionPage 
        employeeId={id} 
        onComplete={handleManagerSelectionComplete}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(44,62,80,0.07)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ marginBottom: '30px', color: '#333' }}>Reset Password</h2>
        {done ? (
          <>
            <p style={{ marginBottom: '30px', color: '#28a745', fontSize: '18px' }}>
              ✅ Password updated successfully!
            </p>
            {!showManagerSelection && (
              <button 
                onClick={onReset}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Go to Login
              </button>
            )}
          </>
        ) : (
          <>
            <div style={{ marginBottom: '30px' }}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              />
            </div>
            <button 
              onClick={handleReset}
              disabled={!newPassword.trim()}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: newPassword.trim() ? '#007bff' : '#e1e5e9',
                color: newPassword.trim() ? 'white' : '#999',
                border: 'none',
                borderRadius: '8px',
                cursor: newPassword.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (newPassword.trim()) {
                  e.target.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (newPassword.trim()) {
                  e.target.style.backgroundColor = '#007bff';
                }
              }}
            >
              Reset Password
            </button>
            {errorMsg && (
              <div style={{ 
                color: '#dc3545', 
                marginTop: '20px', 
                padding: '10px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                {errorMsg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
