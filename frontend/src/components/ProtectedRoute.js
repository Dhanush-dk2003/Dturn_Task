import { useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();

  // Show loading while checking auth
  if (loading) return <div className="text-center mt-5">Loading...</div>;

  // If no user, logout and redirect to login
  if (!user) {
    logout?.();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles are defined and user's role is not included, logout and redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    logout?.();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ If everything is fine, render the protected component
  return children;
};

export default ProtectedRoute;
