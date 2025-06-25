import { createContext, useState } from 'react';
import API from '../axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // TODO: You’ll add logout API later
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
