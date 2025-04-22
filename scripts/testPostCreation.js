import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/.env') });

const testPostCreation = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URL : process.env.MONGO_TEST;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Get a user to use as author
    const user = await User.findOne();
    if (!user) {
      throw new Error('No users found in the database');
    }
    
    console.log(`Using user: ${user.name} (${user._id}) as post author`);
    
    // Create a test post
    const testPost = {
      author: user._id,
      content: 'This is a test post created by the diagnostic script',
      type: 'general',
      media: [] // No media for this test
    };
    
    console.log('Attempting to create post with data:', JSON.stringify(testPost, null, 2));
    
    // Create the post
    const post = await Post.create(testPost);
    console.log('Post created successfully:', post._id);
    
    // Clean up - delete the test post
    await Post.findByIdAndDelete(post._id);
    console.log('Test post cleaned up');
    
    console.log('Test completed successfully - post creation is working on the backend');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testPostCreation();
