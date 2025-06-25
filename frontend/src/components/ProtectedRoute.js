import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-5">Loading...</div>; // 👈 prevent early redirect

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
