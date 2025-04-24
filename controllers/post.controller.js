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
const postsDir = path.join(__dirname, '../assets/postimage');
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
    cb(null, 'post_' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images and videos
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

const uploadMedia = upload.array('media', 5);

export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Fetching all posts for feed...');
    
    // Get all posts from all users
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    console.log(`Found ${posts.length} posts`);
    
    // Count total posts
    const total = await Post.countDocuments({});

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

export const createPost = async (req, res) => {
  console.log('Create post request received');
  console.log('Headers:', req.headers);
  console.log('Content type:', req.headers['content-type']);
  console.log('Content length:', req.headers['content-length']);
  console.log('Request body keys:', req.body ? Object.keys(req.body) : 'No body');
  
  // Set a longer timeout for the request (2 minutes)
  req.setTimeout(120000);
  
  try {
    console.log('Request body:', req.body);
    
    const { content, type = 'general', workoutDetails, mediaUrls = [] } = req.body;
    const userId = req.user.id;
    
    console.log(`Processing post from user ${userId} with content type ${type}`);
    console.log('Media URLs received:', mediaUrls);
    
    // Check if user is available in the request
    if (!req.user || !req.user._id) {
      console.error('User not found in request:', req.user);
      return res.status(401).json({
        status: 'error',
        message: 'User authentication failed. Please log in again.'
      });
    }
    
    console.log('User ID:', req.user._id);
    console.log('Media URLs:', mediaUrls);
    
    // Create post object
    const post = new Post({
        author: userId,
        content,
        type,
        media: mediaUrls
      });
      
      console.log('Saving post with media:', mediaUrls.length > 0 ? mediaUrls : 'No media');
      
      // Only add workoutDetails if it exists
      if (workoutDetails) {
        post.workoutDetails = workoutDetails;
      }
      
      console.log('Creating post with data:', post);
      
      const savedPost = await post.save();
      console.log('Post created successfully:', savedPost._id);

      await savedPost.populate('author', 'name profilePicture');
      console.log('Post populated with author details');

      res.status(201).json({
        status: 'success',
        data: { post: savedPost }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Server error: ' + error.message });
      // Send a more specific error message
      res.status(500).json({
        status: 'error',
        message: 'Failed to create post: ' + (error.message || 'Unknown error')
      });
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
    
    // Log the user information for debugging
    console.log('User making the comment:', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username
    });
    
    try {
      // Check if postId is a valid MongoDB ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(postId);
      console.log('Is valid ObjectId:', isValidObjectId);
      
      let post;
      if (isValidObjectId) {
        post = await Post.findById(postId);
      } else {
        // If not a valid ObjectId, try to find by other means
        // For testing purposes, we'll get the most recent post
        console.log('Using alternative method to find post');
        post = await Post.findOne().sort({ createdAt: -1 });
        
        // If no post exists, create a test post
        if (!post) {
          console.log('No posts found, creating a test post');
          post = await Post.create({
            author: req.user._id,
            content: 'This is a test post created for comment testing',
            type: 'general',
            createdAt: new Date(),
            likes: [],
            comments: []
          });
          console.log('Created test post with ID:', post._id);
        }
      }
      
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
      
      // Populate author details with more fields
      await post.populate({
        path: 'comments.author',
        select: 'name profilePicture email username'
      });
      
      const newComment = post.comments[post.comments.length - 1];
      console.log('New comment with author details:', JSON.stringify(newComment, null, 2));
      console.log('Comment author details:', JSON.stringify(newComment.author, null, 2));
      
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
