import React, { useState } from 'react';
import API from '../api';

const ResetPasswordPage = ({ username, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    await API.post('/reset-password', { username, newPassword });
    setDone(true);
    onReset();
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
        </>
      )}
    </div>
  );
};

export default ResetPasswordPage;
