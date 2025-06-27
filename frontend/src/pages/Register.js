import { useState } from "react";
import API from "../axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    const val = { name: "", email: "", password: "" };
    if (!formData.name.trim()) {
      val.name = "Name is required";
      isValid = false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.(com|in|org|io)$/;
    if (!emailRegex.test(formData.email)) {
      val.email = "Enter a valid email with a proper domain";
      isValid = false;
    }
    if (formData.password.length < 6) {
      val.password = "Password must be at least 6 characters";
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
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 min-vw-100 bg-body-secondary">
      <div className="p-4 bg-white rounded-4 shadow-sm w-100 mx-3" style={{ maxWidth: "400px" }}>
        <h4 className="text-center text-success fw-bold mb-4">Create Account</h4>
        {error && <div className="alert alert-danger text-center py-2 px-3">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <div className="input-group">
              <span className="input-group-text"><FaUser /></span>
              <input
                name="name"
                className={`form-control ${validation.name ? "is-invalid" : ""}`}
                placeholder="Name"
                onChange={handleChange}
              />
            </div>
            {validation.name && <small className="text-danger">{validation.name}</small>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><FaEnvelope /></span>
              <input
                name="email"
                type="email"
                className={`form-control ${validation.email ? "is-invalid" : ""}`}
                placeholder="Email"
                onChange={handleChange}
              />
            </div>
            {validation.email && <small className="text-danger">{validation.email}</small>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><FaLock /></span>
              <input
                name="password"
                type="password"
                className={`form-control ${validation.password ? "is-invalid" : ""}`}
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
            {validation.password && <small className="text-danger">{validation.password}</small>}
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <div className="input-group">
              <span className="input-group-text"><FaUserShield /></span>
              <select name="role" className="form-select" onChange={handleChange}>
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-4 fw-semibold">Register</button>
        </form>

        <p className="mt-3 text-center small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
