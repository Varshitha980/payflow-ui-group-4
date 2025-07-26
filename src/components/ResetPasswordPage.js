import React, { useState } from 'react';
import API from '../api';

const ResetPasswordPage = ({ id, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  console.log("ResetPasswordPage received id:", id);

  const handleReset = async () => {
    try {
      // Log the payload and URL for debugging
      console.log('Reset password URL:', '/employees/reset-password');
      console.log('Reset payload:', { id, newPassword });
      await API.post('/employees/reset-password', { id, newPassword });
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
