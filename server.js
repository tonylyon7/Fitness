import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import { initializeSocket } from './services/socket.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const server = http.createServer(app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 5000;

// Middlewares
// Configure CORS
app.use(cors());

// Enable pre-flight requests for all routes
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

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
app.use('/api', uploadRoutes);
// Register username routes with proper error handling
app.use('/username', usernameRoutes);

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
