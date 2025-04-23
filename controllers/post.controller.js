import Post from '../models/post.model.js';
import { ValidationError } from '../utils/errors.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create posts directory if it doesn't exist
const postsDir = path.join(__dirname, '../assets/posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, postsDir);
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
  console.log('Create post request received');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  uploadMedia(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
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
      console.error('Upload error:', err);
      return res.status(400).json({ 
        status: 'error',
        message: err.message 
      });
    }
    
    console.log('File upload successful');
    if (req.file) {
      console.log('Uploaded file:', req.file);
    } else {
      console.log('No file uploaded');
    }

    try {
      console.log('Processing post data');
      const { content, type = 'general', workoutDetails } = req.body;
      console.log('Post content:', content);
      console.log('Post type:', type);
      
      // Check if user is available in the request
      if (!req.user || !req.user._id) {
        console.error('User not found in request:', req.user);
        return res.status(401).json({
          status: 'error',
          message: 'User authentication failed. Please log in again.'
        });
      }
      
      console.log('User ID:', req.user._id);
      
      const mediaUrl = req.file ? `/assets/posts/${req.file.filename}` : null;
      console.log('Media URL:', mediaUrl);
      
      // Create post object with all required fields
      const postData = {
        author: req.user._id,
        content,
        media: mediaUrl ? [mediaUrl] : [],
        type
      };
      
      // Only add workoutDetails if it exists
      if (workoutDetails) {
        postData.workoutDetails = workoutDetails;
      }
      
      console.log('Creating post with data:', postData);
      
      const post = await Post.create(postData);
      console.log('Post created successfully:', post._id);

      await post.populate('author', 'name profilePicture');
      console.log('Post populated with author details');

      res.status(201).json({
        status: 'success',
        data: { post }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      
      // If there's an error, delete the uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      // Send a more specific error message
      res.status(500).json({
        status: 'error',
        message: 'Failed to create post: ' + (error.message || 'Unknown error')
      });
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
    console.log('Comment request received:', req.body);
    console.log('User in request:', req.user);
    
    const { postId, content } = req.body;
    
    if (!postId) {
      console.error('Missing postId in request');
      return res.status(400).json({
        status: 'error',
        message: 'Post ID is required'
      });
    }
    
    if (!content) {
      console.error('Missing content in request');
      return res.status(400).json({
        status: 'error',
        message: 'Comment content is required'
      });
    }
    
    if (!req.user || !req.user._id) {
      console.error('User not authenticated properly');
      return res.status(401).json({
        status: 'error',
        message: 'User authentication failed'
      });
    }
    
    try {
      const post = await Post.findById(postId);
      if (!post) {
        console.error('Post not found:', postId);
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        });
      }
      
      console.log('Found post:', post._id);
      
      // Add the comment
      post.comments.push({
        author: req.user._id,
        content
      });
      
      await post.save();
      console.log('Post saved with new comment');
      
      // Populate author details
      await post.populate('comments.author', 'name profilePicture');
      console.log('Comment author populated');
      
      const newComment = post.comments[post.comments.length - 1];
      console.log('New comment:', newComment);
      
      return res.status(201).json({
        status: 'success',
        data: { comment: newComment }
      });
    } catch (findError) {
      console.error('Error finding or updating post:', findError);
      return res.status(500).json({
        status: 'error',
        message: 'Error processing comment: ' + findError.message
      });
    }
  } catch (error) {
    console.error('Unexpected error in commentOnPost:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error: ' + error.message
    });
  }
};
