import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModernDashboardStyles.css';

/**
 * Modal component for applying or removing payment holds on employee payslips.
 * This component allows HR/Admin users to place a payment hold on an employee's
 * salary with a reason, or remove an existing payment hold.
 */
const PaymentHoldModal = ({ isOpen, onClose, employeeId, employeeName, currentUser, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentHold, setCurrentHold] = useState(null);
  const [mode, setMode] = useState('apply'); // 'apply' or 'remove'

  // Fetch current payment hold status when modal opens
  useEffect(() => {
    if (isOpen && employeeId) {
      fetchCurrentHoldStatus();
    }
  }, [isOpen, employeeId]);

  // Fetch the current payment hold status for this employee
  const fetchCurrentHoldStatus = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment hold status for employee:', employeeId); // Debug log
      const response = await axios.get(`http://localhost:8081/api/employees/${employeeId}/payment-hold`);
      
      console.log('Payment hold response:', response.data); // Debug log
      
      if (response.data.hasPaymentHold === false) {
        // No payment hold exists
        setCurrentHold(null);
        setMode('apply');
      } else {
        // Payment hold exists
        setCurrentHold(response.data);
        setMode('remove');
        setReason(response.data.reason || '');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching payment hold status:', err);
      console.error('Error details:', err.response?.data, err.response?.status); // Debug log
      setError(`Failed to fetch payment hold status. Please try again. Employee: ${employeeName}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply a payment hold
  const applyPaymentHold = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the payment hold.');
      return;
    }

    try {
      setLoading(true);
      console.log('Applying payment hold for employee:', employeeId, 'with reason:', reason); // Debug log
      const response = await axios.post(
        `http://localhost:8081/api/employees/${employeeId}/apply-payment-hold`,
        {
          reason: reason.trim(),
          appliedBy: currentUser.id
        }
      );

      console.log('Apply payment hold response:', response.data); // Debug log

      if (response.data.success) {
        onSuccess('Payment hold applied successfully');
        onClose();
      } else {
        setError(response.data.message || 'Failed to apply payment hold');
      }
    } catch (err) {
      console.error('Error applying payment hold:', err);
      console.error('Error details:', err.response?.data, err.response?.status); // Debug log
      setError('Failed to apply payment hold. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove a payment hold
  const removePaymentHold = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8081/api/employees/${employeeId}/remove-payment-hold`
      );

      if (response.data.success) {
        onSuccess('Payment hold removed successfully');
        onClose();
      } else {
        setError(response.data.message || 'Failed to remove payment hold');
      }
    } catch (err) {
      console.error('Error removing payment hold:', err);
      setError('Failed to remove payment hold. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'apply') {
      applyPaymentHold();
    } else {
      removePaymentHold();
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'apply' ? 'Apply Payment Hold' : 'Remove Payment Hold'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <p className="employee-info">
            <strong>Employee:</strong> {employeeName}
          </p>
          
          {mode === 'apply' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="reason">Reason for Payment Hold:</label>
                <textarea
                  id="reason"
                  className="form-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for placing a payment hold..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-warning"
                  disabled={loading}
                >
                  {loading ? 'Applying...' : 'Apply Payment Hold'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="form-group">
                <label>Current Hold Reason:</label>
                <p className="hold-reason">{currentHold?.reason || 'No reason provided'}</p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={removePaymentHold}
                  disabled={loading}
                >
                  {loading ? 'Removing...' : 'Remove Payment Hold'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHoldModal;