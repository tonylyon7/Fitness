import Post from '../models/post.model.js';
import { ValidationError } from '../utils/errors.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assetsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadMedia = upload.single('media');

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

export const createPost = (req, res, next) => {
  uploadMedia(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          status: 'error',
          message: 'File size is too large. Max size is 10MB.'
        });
      }
      return res.status(400).json({ 
        status: 'error',
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        status: 'error',
        message: err.message 
      });
    }

    try {
      const { content, type = 'general', workoutDetails } = req.body;
      const mediaUrl = req.file ? `/assets/${req.file.filename}` : null;
      
      const post = await Post.create({
      author: req.user._id,
      content,
      media: mediaUrl ? [mediaUrl] : [],
      type,
      workoutDetails
    });

      await post.populate('author', 'name profilePicture');

      res.status(201).json({
        status: 'success',
        data: { post }
      });
    } catch (error) {
      // If there's an error, delete the uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  });
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
