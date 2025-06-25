import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { isAdmin } from './middleware/roleMiddleware.js';
import projectRoutes from './routes/projectRoutes.js';




dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes); // 👈 mount routes
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api/profile', protect, (req, res) => {
  res.json({ message: 'Welcome!', user: req.user });
});


app.get('/api/admin-only', protect, isAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin!', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
