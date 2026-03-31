import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();
dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});