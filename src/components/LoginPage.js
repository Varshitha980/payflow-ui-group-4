import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN'); // Default to ADMIN
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      let res;
      if (role === 'EMPLOYEE') {
        res = await API.post('/employees/login', { name: username, password });
      } else {
        res = await API.post('/users/login', { username, password });
      }
      const user = res.data;
      if (user.firstLogin) {
        Swal.fire({
          icon: 'info',
          title: 'First Login',
          text: 'You are using the default password. Please reset your password.',
          timer: 2500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome, ${user.name || user.username || username || 'Employee'}!`,
          timer: 1500,
          showConfirmButton: false
        });
      }
      console.log("User object from backend:", user);

      onLogin(user);
    } catch {
      setError('Invalid credentials');
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid username or password',
        timer: 1800,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <select value={role} onChange={e => setRole(e.target.value)} style={{ marginBottom: 10, padding: 6, fontSize: 16 }}>
        <option value="ADMIN">Admin</option>
        <option value="HR">HR</option>
        <option value="MANAGER">Manager</option>
        <option value="EMPLOYEE">Employee</option>
      </select>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
        <span>Default password for new employees is <b>1234</b></span>
      </div>
    </div>
  );
};

export default LoginPage;
