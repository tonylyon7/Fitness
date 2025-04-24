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

// Create profile images directory if it doesn't exist
const profileImagesDir = path.join(assetsDir, 'profileimage');
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Create post images directory if it doesn't exist
const postImagesDir = path.join(assetsDir, 'postimage');
if (!fs.existsSync(postImagesDir)) {
  fs.mkdirSync(postImagesDir, { recursive: true });
}

// Create product images directories if they don't exist
const productImagesDir = path.join(assetsDir, 'products');
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// Create product category subdirectories
const productCategories = ['equipment', 'supplements', 'apparel', 'accessories'];
productCategories.forEach(category => {
  const categoryDir = path.join(productImagesDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
});

// Create coaches directory if it doesn't exist
const coachesImagesDir = path.join(assetsDir, 'coaches');
if (!fs.existsSync(coachesImagesDir)) {
  fs.mkdirSync(coachesImagesDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination directory based on the upload type
    const type = req.body.type || 'default';
    const category = req.body.category || '';
    
    if (type === 'profile') {
      cb(null, profileImagesDir);
    } else if (type === 'post') {
      cb(null, postImagesDir);
    } else if (type === 'product') {
      // If a valid category is provided, use the category subdirectory
      if (category && productCategories.includes(category)) {
        cb(null, path.join(productImagesDir, category));
      } else {
        cb(null, productImagesDir);
      }
    } else if (type === 'coach') {
      cb(null, coachesImagesDir);
    } else {
      cb(null, assetsDir);
    }
  },
  filename: function (req, file, cb) {
    // Get the upload type and use it as a prefix
    const type = req.body.type || 'default';
    
    // Create unique filename with type prefix, timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${type}_${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Generic success response for uploads
const sendSuccessResponse = (req, res, fileUrl, type, category) => {
  res.json({
    status: 'success',
    data: {
      imageUrl: fileUrl,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      type: type,
      category: category || undefined,
      size: req.file.size,
      mimetype: req.file.mimetype
    },
    // Add these for compatibility with different frontend expectations
    imageUrl: fileUrl,
    imagePath: fileUrl,
    url: fileUrl,
    path: fileUrl
  });
};

// Upload profile image
export const uploadProfileImage = (req, res) => {
  // Force the type to be 'profile'
  req.body.type = 'profile';
  
  uploadFile(req, res, function (err) {
    const error = handleUploadError(err, req, res);
    if (error !== null) return; // Error already handled
    
    const fileUrl = `/assets/profileimage/${req.file.filename}`;
    sendSuccessResponse(req, res, fileUrl, 'profile');
  });
};

// Upload post image/video
export const uploadPostMedia = (req, res) => {
  // Force the type to be 'post'
  req.body.type = 'post';
  
  uploadFile(req, res, function (err) {
    const error = handleUploadError(err, req, res);
    if (error !== null) return; // Error already handled
    
    const fileUrl = `/assets/postimage/${req.file.filename}`;
    sendSuccessResponse(req, res, fileUrl, 'post');
  });
};

// Upload product image
export const uploadProductImage = (req, res) => {
  // Force the type to be 'product'
  req.body.type = 'product';
  const category = req.body.category || '';
  
  uploadFile(req, res, function (err) {
    const error = handleUploadError(err, req, res);
    if (error !== null) return; // Error already handled
    
    let fileUrl;
    if (category && productCategories.includes(category)) {
      fileUrl = `/assets/products/${category}/${req.file.filename}`;
    } else {
      fileUrl = `/assets/products/${req.file.filename}`;
    }
    
    sendSuccessResponse(req, res, fileUrl, 'product', category);
  });
};

// Upload coach image
export const uploadCoachImage = (req, res) => {
  // Force the type to be 'coach'
  req.body.type = 'coach';
  
  uploadFile(req, res, function (err) {
    const error = handleUploadError(err, req, res);
    if (error !== null) return; // Error already handled
    
    const fileUrl = `/assets/coaches/${req.file.filename}`;
    sendSuccessResponse(req, res, fileUrl, 'coach');
  });
};

// Generic upload for backward compatibility
export const uploadMedia = (req, res) => {
  uploadFile(req, res, function (err) {
    const error = handleUploadError(err, req, res);
    if (error !== null) return; // Error already handled
    
    // Determine the type of upload
    const type = req.body.type || 'default';
    const category = req.body.category || '';
    
    // Construct the appropriate URL path based on the upload type
    let fileUrl;
    if (type === 'profile') {
      fileUrl = `/assets/profileimage/${req.file.filename}`;
    } else if (type === 'post') {
      fileUrl = `/assets/postimage/${req.file.filename}`;
    } else if (type === 'product') {
      if (category && productCategories.includes(category)) {
        fileUrl = `/assets/products/${category}/${req.file.filename}`;
      } else {
        fileUrl = `/assets/products/${req.file.filename}`;
      }
    } else if (type === 'coach') {
      fileUrl = `/assets/coaches/${req.file.filename}`;
    } else {
      fileUrl = `/assets/${req.file.filename}`;
    }
    
    sendSuccessResponse(req, res, fileUrl, type, category);
  });
};
