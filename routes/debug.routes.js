import express from 'express';

const router = express.Router();

// Debug route to check environment variables
router.get('/env', (req, res) => {
  // Only show this in development environment
  if (process.env.NODE_ENV !== 'production') {
    // Create a safe version of the environment variables
    const safeEnv = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 'not set',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || 'not set',
      // Don't include actual secrets, just whether they're set
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'set' : 'not set',
      PORT: process.env.PORT || 'not set',
      MONGO_URL: process.env.MONGO_URL ? 'set' : 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'not set'
    };
    
    return res.json({
      message: 'Environment variables (safe view)',
      env: safeEnv
    });
  }
  
  return res.status(403).json({
    message: 'This endpoint is only available in development mode'
  });
});

export default router;
