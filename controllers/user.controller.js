import User from '../models/user.model.js';
import { ValidationError } from '../utils/errors.js';

export const getProfile = async (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user }
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePicture, branch, job, fitnessLevel } = req.body;
    
    // Get the current user to preserve the username
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      throw new ValidationError('User not found');
    }
    
    // Update user while preserving the username
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name, 
        bio, 
        profilePicture, 
        branch, 
        job,
        fitnessLevel,
        // Explicitly preserve the username
        username: currentUser.username
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      throw new ValidationError('You cannot follow yourself');
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      throw new ValidationError('User not found');
    }

    const alreadyFollowing = req.user.following.includes(userId);
    if (alreadyFollowing) {
      throw new ValidationError('Already following this user');
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { followers: req.user._id }
    });

    res.json({
      status: 'success',
      message: 'Successfully followed user'
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      throw new ValidationError('You cannot unfollow yourself');
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      throw new ValidationError('User not found');
    }

    const isFollowing = req.user.following.includes(userId);
    if (!isFollowing) {
      throw new ValidationError('Not following this user');
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user._id }
    });

    res.json({
      status: 'success',
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    next(error);
  }
};
