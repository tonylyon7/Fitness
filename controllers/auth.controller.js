import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ValidationError } from '../utils/errors.js';

const generateTokens = (userId) => {
  try {
    // Default expiration times if environment variables are not set
    const defaultAccessExpiry = '1h'; // 1 hour
    const defaultRefreshExpiry = '7d'; // 7 days
    
    // Ensure expiresIn is a valid string format
    let accessExpiresIn = '1h';
    let refreshExpiresIn = '7d';
    
    // Only use environment variables if they are properly formatted
    if (process.env.JWT_EXPIRES_IN && 
        (typeof process.env.JWT_EXPIRES_IN === 'number' || 
         /^\d+[smhdwy]$/.test(process.env.JWT_EXPIRES_IN))) {
      accessExpiresIn = process.env.JWT_EXPIRES_IN;
    }
    
    if (process.env.JWT_REFRESH_EXPIRES_IN && 
        (typeof process.env.JWT_REFRESH_EXPIRES_IN === 'number' || 
         /^\d+[smhdwy]$/.test(process.env.JWT_REFRESH_EXPIRES_IN))) {
      refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
    }
    
    console.log('Using token expiration times:', { accessExpiresIn, refreshExpiresIn });
    
    // Generate access token
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: accessExpiresIn }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error generating tokens:', error);
    
    // Fallback to hardcoded values if token generation fails
    const accessToken = jwt.sign(
      { userId },
      'fallback-secret-key',
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      'fallback-refresh-secret-key',
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, username } = req.body;

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new ValidationError('Email already exists');
    }
    
    // Check if username exists
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new ValidationError('Username already exists');
      }
    } else {
      throw new ValidationError('Username is required');
    }

    const user = await User.create({
      email,
      password,
      name,
      username
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      },
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new ValidationError('Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      },
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ValidationError('Invalid refresh token');
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};
