import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { clerkMiddleware } from '@clerk/express';
import startupRoutes from './routes/startupRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB via mongoose'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use('/api', startupRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Startup AI Simulator Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
