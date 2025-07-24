// src/components/EmployeeForm.js
import React, { useState } from 'react';
import './EmployeeForm.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeForm = () => {
  const [employee, setEmployee] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    totalExperience: '',
    pastExperience: '',
    designation: '',
    department: ''
  });

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/api/employees/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    })
      .then((res) => {
        if (res.ok) {
          toast.success('Employee onboarded successfully!');
          setEmployee({
            name: '',
            age: '',
            email: '',
            phone: '',
            totalExperience: '',
            pastExperience: '',
            designation: '',
            department: ''
          });
        } else {
          toast.error('Failed to onboard employee.');
        }
      })
      .catch(() => toast.error('Server error.'));
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <h2>Employee Onboarding</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={employee.name} onChange={handleChange} placeholder="Full Name" required />
        <input type="number" name="age" value={employee.age} onChange={handleChange} placeholder="Age" required />
        <input type="email" name="email" value={employee.email} onChange={handleChange} placeholder="Email" required />
        <input type="tel" name="phone" value={employee.phone} onChange={handleChange} placeholder="Phone Number" required />
        <input type="number" name="totalExperience" value={employee.totalExperience} onChange={handleChange} placeholder="Total Experience (years)" required />
        <input name="pastExperience" value={employee.pastExperience} onChange={handleChange} placeholder="Past Experience" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
