import React, { useState } from 'react';
import API from '../axios';

const AssignTaskModal = ({ project, onClose, onTaskAssigned }) => {
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!title || !email) return;
    try {
      await API.post('/tasks', {
        title,
        status: 'TODO',
        projectName: project.name,
        userEmail: email
      });
      onTaskAssigned(); // Refresh data
      onClose(); // Close modal
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <form onSubmit={handleAssign}>
            <div className="modal-header">
              <h5 className="modal-title">Assign Task - {project.name}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <input
                className="form-control mb-2"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="form-control"
                placeholder="Assign to (email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" type="submit">Assign</button>
              <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;
