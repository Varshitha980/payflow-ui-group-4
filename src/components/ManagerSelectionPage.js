import React, { useState, useEffect } from 'react';
import API from '../api';

const ManagerSelectionPage = ({ employeeId, onComplete }) => {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/users/managers');
      const data = await response.json();
      
      // Filter only active managers
      const activeManagers = data.filter(manager => 
        manager.status === 'Active' || manager.status === 'ACTIVE'
      );
      
      setManagers(activeManagers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading managers:', error);
      setErrorMsg('Failed to load managers. Please try again.');
      setLoading(false);
    }
  };

  const handleManagerSelection = async () => {
    if (!selectedManager) {
      setErrorMsg('Please select a manager.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8081/api/employees/${employeeId}/assign-manager/${selectedManager}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        onComplete();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || 'Failed to assign manager.');
      }
    } catch (error) {
      console.error('Error assigning manager:', error);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Loading Managers...</h2>
          <p style={{ color: '#666' }}>Please wait while we load available managers.</p>
        </div>
      </div>
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
        <h2 style={{ marginBottom: '10px', color: '#333' }}>Select Your Manager</h2>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Please choose the manager you would like to work under:
        </p>
        
        <div style={{ marginBottom: '30px' }}>
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
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
          >
            <option value="">Select a Manager</option>
            {managers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.username} ({manager.role})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleManagerSelection}
          disabled={submitting || !selectedManager}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: selectedManager ? '#007bff' : '#e1e5e9',
            color: selectedManager ? 'white' : '#999',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedManager ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedManager) {
              e.target.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedManager) {
              e.target.style.backgroundColor = '#007bff';
            }
          }}
        >
          {submitting ? 'Assigning Manager...' : 'Assign Manager'}
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

        {managers.length === 0 && (
          <div style={{ 
            color: '#856404', 
            marginTop: '20px', 
            padding: '10px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            No active managers available. Please contact HR for assistance.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerSelectionPage; 