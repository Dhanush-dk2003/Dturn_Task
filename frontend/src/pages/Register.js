import { useState } from 'react';
import API from '../axios';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    const val = { name: '', email: '', password: '' };
    if (!formData.name.trim()) {
      val.name = 'Name is required';
      isValid = false;
    }
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      val.email = 'Enter a valid email';
      isValid = false;
    }
    if (formData.password.length < 6) {
      val.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    setValidation(val);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await API.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center min-vh-100 bg-body-secondary animate__animated animate__fadeIn">
      <div className="p-4 bg-white rounded-5 shadow-lg border border-0 position-absolute top-50 start-50 translate-middle" style={{ maxWidth: '380px', width: '100%' }}>
        <h4 className="text-center text-success fw-bold mb-4">Create Account</h4>
        {error && <div className="alert alert-danger text-center py-2 px-3">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaUser /></span>
            <input name="name" className={`form-control ${validation.name ? 'is-invalid' : ''}`} placeholder="Name" onChange={handleChange} required />
            {validation.name && <div className="invalid-tooltip d-block">{validation.name}</div>}
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaEnvelope /></span>
            <input name="email" type="email" className={`form-control ${validation.email ? 'is-invalid' : ''}`} placeholder="Email" onChange={handleChange} required />
            {validation.email && <div className="invalid-tooltip d-block">{validation.email}</div>}
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaLock /></span>
            <input name="password" type="password" className={`form-control ${validation.password ? 'is-invalid' : ''}`} placeholder="Password" onChange={handleChange} required />
            {validation.password && <div className="invalid-tooltip d-block">{validation.password}</div>}
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaUserShield /></span>
            <select name="role" className="form-select" onChange={handleChange}>
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-4 fw-semibold">Register</button>
        </form>
        <p className="mt-3 text-center small">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
