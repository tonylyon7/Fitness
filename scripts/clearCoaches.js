import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Coach from '../models/coach.model.js';
import User from '../models/user.model.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/.env') });

const clearCoaches = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URL : process.env.MONGO_TEST;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete all coaches
    await Coach.deleteMany({});
    console.log('Deleted all coaches');

    // Delete all users with role 'coach'
    await User.deleteMany({ role: 'coach' });
    console.log('Deleted all coach users');

    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearCoaches();
