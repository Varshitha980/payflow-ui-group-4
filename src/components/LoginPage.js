import React, { useState } from 'react';
import API from '../api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN'); // Default to ADMIN
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter both username and password',
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send a single, consistent payload for all roles
      const loginPayload = { username: username, password: password };
      console.log('Attempting login with:', loginPayload);

      // Post the determined payload to the API
      const res = await API.post('/auth/login', loginPayload);

      const user = res.data;
      console.log('User object from backend:', user);

      if (user.token) {
        localStorage.setItem('auth_token', user.token);
      }

      if (user.firstLogin) {
        Swal.fire({
          icon: 'info',
          title: 'First Login',
          text: 'You are using the default password. Please reset your password.',
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome, ${user.name || user.username || username || 'Employee'}!`,
          timer: 1500,
          showConfirmButton: false,
        });
      }

      if (!user.role) {
        user.role = role;
      }

      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials');
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid username or password',
        timer: 1800,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      background: 'white'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#4f46e5' }}>Login</h2>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '5px', 
          backgroundColor: '#ffebee', 
          color: '#d32f2f',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Role</label>
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        >
          <option value="ADMIN">Admin</option>
          <option value="HR">HR</option>
          <option value="MANAGER">Manager</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
          {role === 'EMPLOYEE' ? 'Email' : 'Username'}
        </label>
        <input 
          placeholder={role === 'EMPLOYEE' ? 'Enter your email' : 'Enter your username'} 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Password</label>
        <input 
          type="password" 
          placeholder="Enter your password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>
      
      <button 
        onClick={handleLogin} 
        disabled={isLoading}
        style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: isLoading ? '#a5a5a5' : '#4f46e5', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      
      <div style={{ marginTop: '20px', color: '#888', fontSize: '14px', textAlign: 'center' }}>
        <span>Default password for new employees is <b>1234</b></span>
      </div>
    </div>
  );
};

export default LoginPage;