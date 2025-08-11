import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api', // Spring Boot backend
});

// Add request interceptor to include auth token if available
API.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
