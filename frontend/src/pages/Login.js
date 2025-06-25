import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {FaLock, FaEnvelope} from 'react-icons/fa';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    const val = { email: '', password: '' };
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      val.email = 'Please enter a valid email';
      isValid = false;
    }
    if (password.length < 6) {
      val.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    setValidation(val);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid login');
    }
  };

  return (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center min-vh-100 bg-body-secondary animate__animated animate__fadeIn">
      <div className="p-4 bg-white rounded-5 shadow-lg border border-0 position-absolute top-50 start-50 translate-middle" style={{ maxWidth: '380px', width: '100%' }}>
        <h4 className="text-center text-primary fw-bold mb-4">Welcome Back</h4>
        {error && <div className="alert alert-danger text-center py-2 px-3">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaEnvelope /></span>
            <input type="email" className={`form-control ${validation.email ? 'is-invalid' : ''}`} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            {validation.email && <div className="invalid-tooltip d-block">{validation.email}</div>}
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaLock /></span>
            <input type="password" className={`form-control ${validation.password ? 'is-invalid' : ''}`} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {validation.password && <div className="invalid-tooltip d-block">{validation.password}</div>}
          </div>
          <button className="btn btn-primary w-100 rounded-4 fw-semibold">Login</button>
        </form>
        <p className="mt-3 text-center small">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;