import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Product from '../models/product.model.js';
import Coach from '../models/coach.model.js';
import { ValidationError } from '../utils/errors.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalProducts,
      totalCoaches
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Product.countDocuments(),
      Coach.countDocuments()
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          users: totalUsers,
          posts: totalPosts,
          products: totalProducts,
          coaches: totalCoaches
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    user.role = role;
    await user.save();

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Delete user's posts
    await Post.deleteMany({ author: userId });

    // Remove user from followers/following lists
    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }] },
      { $pull: { followers: userId, following: userId } }
    );

    // Delete user
    await user.remove();

    res.json({
      status: 'success',
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const manageContent = async (req, res, next) => {
  try {
    const { action, contentType, contentId } = req.body;

    let result;
    switch (contentType) {
      case 'post':
        if (action === 'delete') {
          result = await Post.findByIdAndDelete(contentId);
        }
        break;
      case 'product':
        if (action === 'delete') {
          result = await Product.findByIdAndDelete(contentId);
        }
        break;
      default:
        throw new ValidationError('Invalid content type');
    }

    if (!result) {
      throw new ValidationError('Content not found');
    }

    res.json({
      status: 'success',
      message: `${contentType} ${action}d successfully`
    });
  } catch (error) {
    next(error);
  }
};
