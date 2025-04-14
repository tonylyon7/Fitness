import Post from '../models/post.model.js';
import { ValidationError } from '../utils/errors.js';

export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts from users that the current user follows and their own posts
    const posts = await Post.find({
      $or: [
        { author: { $in: req.user.following } },
        { author: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    const total = await Post.countDocuments({
      $or: [
        { author: { $in: req.user.following } },
        { author: req.user._id }
      ]
    });

    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { content, media, type, workoutDetails } = req.body;
    
    const post = await Post.create({
      author: req.user._id,
      content,
      media,
      type,
      workoutDetails
    });

    await post.populate('author', 'name profilePicture');

    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      throw new ValidationError('Post not found');
    }

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      throw new ValidationError('Post already liked');
    }

    post.likes.push(req.user._id);
    await post.save();

    res.json({
      status: 'success',
      message: 'Post liked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { postId, content } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      throw new ValidationError('Post not found');
    }

    post.comments.push({
      author: req.user._id,
      content
    });

    await post.save();
    await post.populate('comments.author', 'name profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      status: 'success',
      data: { comment: newComment }
    });
  } catch (error) {
    next(error);
  }
};
