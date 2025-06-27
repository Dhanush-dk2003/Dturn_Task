import { useState, useContext,useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    const val = { email: "", password: "" };
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      val.email = "Please enter a valid email";
      isValid = false;
    }
    if (password.length < 6) {
      val.password = "Password must be at least 6 characters";
      isValid = false;
    }
    setValidation(val);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      if (loggedInUser.role === "ADMIN") navigate("/admindashboard");
      else if (loggedInUser.role === "MANAGER") navigate("/managerdashboard");
      else navigate("/userdashboard");
    } else {
      setError("Invalid login");
    }
  };
useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.go(1);
  };
}, []);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 min-vw-100 bg-body-secondary">
      <div className="p-4 bg-white rounded-4 shadow-sm w-100 mx-3" style={{ maxWidth: "400px" }}>
        <h4 className="text-center text-primary fw-bold mb-4">Welcome Back</h4>
        {error && <div className="alert alert-danger text-center py-2 px-3">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><FaEnvelope /></span>
              <input
                type="email"
                className={`form-control ${validation.email ? "is-invalid" : ""}`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {validation.email && <small className="text-danger">{validation.email}</small>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><FaLock /></span>
              <input
                type="password"
                className={`form-control ${validation.password ? "is-invalid" : ""}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {validation.password && <small className="text-danger">{validation.password}</small>}
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-4 fw-semibold">Login</button>
        </form>

        <p className="mt-3 text-center small">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
