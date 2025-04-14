import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Load environment variables from config folder
dotenv.config({ path: './config/.env' });
console.log('Environment loaded from config folder');

// Initialize express app
const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fitness API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Log connection attempt (safely)
    const sanitizedUri = process.env.MONGODB_URI.replace(
      /(mongodb\+srv:\/\/[^:]+:)[^@]+(@.*)/,
      '$1[HIDDEN]$2'
    );
    console.log('Attempting to connect to MongoDB:', sanitizedUri);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('Connected to MongoDB Atlas successfully!');
    
    // Log database connection info
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    console.log(`Connected to database: ${dbName} on host: ${host}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB');
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
