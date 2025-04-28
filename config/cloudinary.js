import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded Cloudinary credentials (from your .env file)
const cloudinaryConfig = {
  cloud_name: 'danmh7pdk',
  api_key: '712219987451919',
  api_secret: '-Xg5-Chsd_3Af68sDIYclCbwX8q8'
};

// Configure Cloudinary with hardcoded values
cloudinary.config(cloudinaryConfig);

// Log Cloudinary configuration for debugging
console.log('Cloudinary configured successfully with the following credentials:', {
  cloud_name: cloudinaryConfig.cloud_name ? 'Set' : 'Not set',
  api_key: cloudinaryConfig.api_key ? 'Set' : 'Not set',
  api_secret: cloudinaryConfig.api_secret ? 'Set' : 'Not set'
});


export default cloudinary;
