import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for multer to store files temporarily before uploading to Cloudinary
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer to use temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp_${uniqueSuffix}${path.extname(file.originalname)}`);
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
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

const uploadFile = upload.single('media');

// Generic error handler for upload errors
const handleUploadError = (err, req, res) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        status: 'error',
        message: 'File size is too large. Max size is 200MB.'
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

  if (!req.file) {
    return res.status(400).json({ 
      status: 'error',
      message: 'No file uploaded'
    });
  }
  
  return null; // No error
};

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    console.log(`Uploading file to Cloudinary folder: ${folder}`);
    console.log(`File path: ${filePath}, exists: ${fs.existsSync(filePath)}`);
    
        // Cloudinary is now configured with hardcoded values in config/cloudinary.js
    
    // Log file stats before upload
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    // Upload the file to Cloudinary with timeout and retries
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // auto-detect whether it's an image or video
      timeout: 120000, // 2 minute timeout
      use_filename: true,
      unique_filename: true
    });

    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

    // Remove the temporary file
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    console.error('Error details:', error.message);
    
    // Remove the temporary file in case of error
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Temporary file removed after error');
      } catch (unlinkError) {
        console.error('Failed to remove temporary file:', unlinkError.message);
      }
    }
    throw error;
  }
};

// Generic success response for uploads
const sendSuccessResponse = (res, cloudinaryResult, type, category) => {
  res.json({
    status: 'success',
    data: {
      imageUrl: cloudinaryResult.url,
      message: 'File uploaded successfully to cloud storage',
      type: type,
      category: category || undefined,
      public_id: cloudinaryResult.public_id,
      resource_type: cloudinaryResult.resource_type
    },
    // Add these for compatibility with different frontend expectations
    imageUrl: cloudinaryResult.url,
    imagePath: cloudinaryResult.url,
    url: cloudinaryResult.url,
    path: cloudinaryResult.url
  });
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  // Force the type to be 'profile'
  req.body.type = 'profile';
  
  uploadFile(req, res, async function (err) {
    try {
      const error = handleUploadError(err, req, res);
      if (error !== null) return; // Error already handled
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path, 'fitness/profiles');
      sendSuccessResponse(res, cloudinaryResult, 'profile');
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to cloud storage'
      });
    }
  });
};

// Upload post image/video
export const uploadPostMedia = async (req, res) => {
  // Force the type to be 'post'
  req.body.type = 'post';
  
  uploadFile(req, res, async function (err) {
    try {
      const error = handleUploadError(err, req, res);
      if (error !== null) return; // Error already handled
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path, 'fitness/posts');
      sendSuccessResponse(res, cloudinaryResult, 'post');
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload media to cloud storage'
      });
    }
  });
};

// Upload product image
export const uploadProductImage = async (req, res) => {
  // Force the type to be 'product'
  req.body.type = 'product';
  const category = req.body.category || '';
  
  uploadFile(req, res, async function (err) {
    try {
      const error = handleUploadError(err, req, res);
      if (error !== null) return; // Error already handled
      
      const folder = category ? `fitness/products/${category}` : 'fitness/products';
      const cloudinaryResult = await uploadToCloudinary(req.file.path, folder);
      sendSuccessResponse(res, cloudinaryResult, 'product', category);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to cloud storage'
      });
    }
  });
};

// Upload coach image
export const uploadCoachImage = async (req, res) => {
  // Force the type to be 'coach'
  req.body.type = 'coach';
  
  uploadFile(req, res, async function (err) {
    try {
      const error = handleUploadError(err, req, res);
      if (error !== null) return; // Error already handled
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path, 'fitness/coaches');
      sendSuccessResponse(res, cloudinaryResult, 'coach');
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to cloud storage'
      });
    }
  });
};

// Generic upload for backward compatibility
export const uploadMedia = async (req, res) => {
  uploadFile(req, res, async function (err) {
    try {
      const error = handleUploadError(err, req, res);
      if (error !== null) return; // Error already handled
      
      // Determine the type of upload
      const type = req.body.type || 'default';
      const category = req.body.category || '';
      
      // Determine the appropriate Cloudinary folder
      let folder;
      if (type === 'profile') {
        folder = 'fitness/profiles';
      } else if (type === 'post') {
        folder = 'fitness/posts';
      } else if (type === 'product') {
        folder = category ? `fitness/products/${category}` : 'fitness/products';
      } else if (type === 'coach') {
        folder = 'fitness/coaches';
      } else {
        folder = 'fitness/general';
      }
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path, folder);
      sendSuccessResponse(res, cloudinaryResult, type, category);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload media to cloud storage'
      });
    }
  });
};
