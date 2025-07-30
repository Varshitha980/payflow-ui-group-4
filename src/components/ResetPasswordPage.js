import React, { useState } from 'react';
import API from '../api';

const ResetPasswordPage = ({ id, username, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  console.log("ResetPasswordPage received id:", id, "username:", username);

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
      onReset();
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrorMsg(error?.response?.data || 'Failed to reset password.');
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      {done ? (
        <>
          <p>Password updated successfully!</p>
          <button onClick={onReset}>Go to Login</button>
        </>
      ) : (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button onClick={handleReset}>Reset</button>
          {errorMsg && <div style={{ color: 'red', marginTop: 10 }}>{errorMsg}</div>}
        </>
      )}
    </div>
  );
};

export default ResetPasswordPage;
