// src/components/EmployeeForm.js
import React, { useState } from 'react';
import './EmployeeForm.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [employee, setEmployee] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    totalExperience: '',
    pastExperience: '',
    position: '', // Changed from designation
    address: '', // Added missing field
    education: '', // Added missing field
    experiences: '', // Added missing field
    role: 'EMPLOYEE', // Added missing field
    status: 'ACTIVE', // Added missing field
    username: '', // Added missing field
    password: '1234', // Added missing field
    pfNumber: '', // Added PF number field
    basicSalary: '',
    hra: '',
    allowances: '',
    bonuses: '',
    pfContribution: '',
    gratuity: ''
  });

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate total CTC
    const totalCtc = (
      parseFloat(employee.basicSalary || 0) +
      parseFloat(employee.hra || 0) +
      parseFloat(employee.allowances || 0) +
      parseFloat(employee.bonuses || 0) +
      parseFloat(employee.pfContribution || 0) +
      parseFloat(employee.gratuity || 0)
    );

    // Generate username from email
    const username = employee.email.split('@')[0];

    // Add required fields to employee data
    const employeeData = {
      ...employee,
      username: username,
      totalCtc: totalCtc.toString(),
      address: employee.address || 'Default Address',
      education: employee.education || 'Default Education',
      experiences: employee.experiences || '[]'
    };

    fetch('http://localhost:8081/api/employees/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
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
            position: '',
            address: '',
            education: '',
            experiences: '',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
            username: '',
            password: '1234',
            pfNumber: '',
            basicSalary: '',
            hra: '',
            allowances: '',
            bonuses: '',
            pfContribution: '',
            gratuity: ''
          });
          setCurrentStep(1);
        } else {
          toast.error('Failed to onboard employee.');
        }
      })
      .catch(() => toast.error('Server error.'));
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <h3>Personal Information</h3>
            <input name="name" value={employee.name} onChange={handleChange} placeholder="Full Name" required />
            <input type="number" name="age" value={employee.age} onChange={handleChange} placeholder="Age" required />
            <input type="email" name="email" value={employee.email} onChange={handleChange} placeholder="Email" required />
            <input type="tel" name="phone" value={employee.phone} onChange={handleChange} placeholder="Phone Number" required />
            <input name="address" value={employee.address} onChange={handleChange} placeholder="Address" required />
          </>
        );
      case 2:
        return (
          <>
            <h3>Professional Information</h3>
            <input type="number" name="totalExperience" value={employee.totalExperience} onChange={handleChange} placeholder="Total Experience (years)" required />
            <input name="pastExperience" value={employee.pastExperience} onChange={handleChange} placeholder="Past Experience" />
            <input name="position" value={employee.position} onChange={handleChange} placeholder="Position" required />
            <input name="education" value={employee.education} onChange={handleChange} placeholder="Education" required />
            <input name="experiences" value={employee.experiences} onChange={handleChange} placeholder="Experiences (JSON format)" />
          </>
        );
              case 3:
        return (
          <>
            <h3>CTC Details</h3>
            <div style={{marginBottom: '10px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>PF Number *</label>
              <input type="text" name="pfNumber" value={employee.pfNumber} onChange={handleChange} placeholder="Enter PF Number" required style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} />
            </div>
            <input type="number" name="basicSalary" value={employee.basicSalary} onChange={handleChange} placeholder="Basic Salary" required />
            <input type="number" name="hra" value={employee.hra} onChange={handleChange} placeholder="HRA" required />
            <input type="number" name="allowances" value={employee.allowances} onChange={handleChange} placeholder="Allowances" required />
            <input type="number" name="bonuses" value={employee.bonuses} onChange={handleChange} placeholder="Bonuses" />
            <input type="number" name="pfContribution" value={employee.pfContribution} onChange={handleChange} placeholder="PF Contribution" required />
            <input type="number" name="gratuity" value={employee.gratuity} onChange={handleChange} placeholder="Gratuity" required />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <h2>Employee Onboarding - Step {currentStep} of 3 - PF Number Added!</h2>
      <form onSubmit={handleSubmit}>
        {renderStep()}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="btn-secondary">
              Previous
            </button>
          )}
          {currentStep < 3 ? (
            <button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="btn-primary">
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
