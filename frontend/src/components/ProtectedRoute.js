import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Optional: logout or redirect to their correct dashboard
    // if (user.role === 'ADMIN') return <Navigate to="/admindashboard" />;
    // if (user.role === 'MANAGER') return <Navigate to="/managerdashboard" />;
    // if (user.role === 'USER') return <Navigate to="/userdashboard" />;

    // fallback
    logout?.();
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
