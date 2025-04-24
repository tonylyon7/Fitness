import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import { initializeSocket } from './services/socket.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories for file uploads
const createUploadDirectories = () => {
  const directories = [
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'assets/profileimage'),
    path.join(__dirname, 'assets/postimage'),
    path.join(__dirname, 'assets/products'),
    path.join(__dirname, 'assets/products/equipment'),
    path.join(__dirname, 'assets/products/supplements'),
    path.join(__dirname, 'assets/products/apparel'),
    path.join(__dirname, 'assets/products/accessories'),
    path.join(__dirname, 'assets/coaches')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create all required directories on startup
createUploadDirectories();

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import storeRoutes from './routes/store.routes.js';
import coachRoutes from './routes/coach.routes.js';
import chatRoutes from './routes/chat.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import usernameRoutes from './routes/username.routes.js';
import debugRoutes from './routes/debug.routes.js';

// Load environment variables from config folder
try {
  dotenv.config({ path: './config/.env' });
  console.log('Environment loaded from config folder');
} catch (error) {
  console.log('Error loading .env file, will use environment variables if set');
}

// Log environment mode
console.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);

// Initialize express app
const app = express();
const server = http.createServer({
  timeout: 300000 // 5 minutes timeout
}, app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 5000;

// Middlewares
// Configure CORS
app.use(cors());

// Enable pre-flight requests for all routes
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configure upload routes with correct path
app.use('/uploads', uploadRoutes);

// Log all registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods);
        console.log(`${methods} ${middleware.regexp} ${path}`);
      }
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fitness API' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postRoutes);
app.use('/store', storeRoutes);
app.use('/coaches', coachRoutes);
app.use('/chat', chatRoutes);
app.use('/subscription', subscriptionRoutes);
// Legacy upload route - keeping for backward compatibility
app.use('/api', uploadRoutes);
// Register username routes with proper error handling
app.use('/username', usernameRoutes);
// Debug routes (only available in development)
app.use('/debug', debugRoutes);

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
    // Get MongoDB URI with fallbacks for different environments
    let mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    
    // If we're not in production and have a test URI, use that instead
    if (process.env.NODE_ENV !== 'production' && process.env.MONGO_TEST) {
      mongoUri = process.env.MONGO_TEST;
    }
    
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined. Please set MONGO_URL or MONGODB_URI environment variable');
    }
    
    // Fix database name case sensitivity issue
    // Extract the database name from the URI
    const dbNameMatch = mongoUri.match(/\/([^\/\?]+)(\?|$)/);
    if (dbNameMatch && dbNameMatch[1]) {
      const dbName = dbNameMatch[1];
      // Replace with the correct database name (Fitness with capital F)
      mongoUri = mongoUri.replace(`/${dbName}`, '/Fitness');
      console.log(`Using database: Fitness`);
    }

    // Log connection attempt (safely)
    const sanitizedUri = mongoUri.replace(
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

    await mongoose.connect(mongoUri, options);
    
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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Increase timeout for all requests
server.timeout = 300000; // 5 minutes
