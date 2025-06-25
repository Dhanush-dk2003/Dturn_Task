import { register } from '../services/authService.js';
import { login } from '../services/authService.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await register(email, password, name, role);
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { token, user } = await login(email, password);

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
};
