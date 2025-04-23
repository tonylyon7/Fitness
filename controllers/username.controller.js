import User from '../models/user.model.js';
import Coach from '../models/coach.model.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Check if a username is available
 * @route GET /api/username/check/:username
 */
export const checkUsername = async (req, res, next) => {
  try {
    console.log('Username check request received for:', req.params);
    const { username } = req.params;
    
    if (!username) {
      console.error('Username parameter is missing');
      return res.status(400).json({
        status: 'error',
        message: 'Username parameter is required'
      });
    }
    
    console.log('Checking username:', username);
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_\.]+$/;
    if (!usernameRegex.test(username)) {
      console.log('Username format validation failed');
      return res.status(400).json({
        status: 'error',
        message: 'Username can only contain letters, numbers, underscores, and periods'
      });
    }
    
    if (username.length < 3 || username.length > 30) {
      console.log('Username length validation failed');
      return res.status(400).json({
        status: 'error',
        message: 'Username must be between 3 and 30 characters'
      });
    }
    
    // Check if username exists in either user or coach model
    console.log('Checking if username exists in user or coach database');
    const existingUser = await User.findOne({ username });
    
    // If username not found in users, check in coaches
    let existingCoach = null;
    if (!existingUser) {
      // For coaches, we need to get the user ID first and then check the username
      const coachUsers = await User.find({ userType: 'coach' });
      const coachUserIds = coachUsers.map(user => user._id);
      
      // Find coaches with these user IDs
      const coaches = await Coach.find({ user: { $in: coachUserIds } }).populate('user');
      
      // Check if any coach's associated user has the username
      existingCoach = coaches.find(coach => coach.user.username === username);
    }
    
    if (existingUser || existingCoach) {
      console.log('Username already exists, generating suggestions');
      // Generate suggestions
      const suggestions = await generateUsernameSuggestions(username);
      
      const response = {
        available: false,
        suggestions
      };
      console.log('Sending response:', response);
      return res.status(200).json(response);
    }
    
    console.log('Username is available');
    return res.status(200).json({
      available: true
    });
  } catch (error) {
    console.error('Error in username check:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Generate username suggestions based on the requested username
 */
const generateUsernameSuggestions = async (username) => {
  const suggestions = [];
  
  // Add a random number to the end
  for (let i = 0; i < 3; i++) {
    const randomNum = Math.floor(Math.random() * 1000);
    suggestions.push(`${username}${randomNum}`);
  }
  
  // Add a random suffix
  const suffixes = ['_user', '_fitness', '_pro', '_official', '_real'];
  for (let i = 0; i < 2; i++) {
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    suggestions.push(`${username}${randomSuffix}`);
  }
  
  // Filter out suggestions that already exist
  const availableSuggestions = [];
  
  for (const suggestion of suggestions) {
    const exists = await User.findOne({ username: suggestion });
    if (!exists) {
      availableSuggestions.push(suggestion);
    }
    
    // Return up to 5 suggestions
    if (availableSuggestions.length >= 5) {
      break;
    }
  }
  
  return availableSuggestions;
};
