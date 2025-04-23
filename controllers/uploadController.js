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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination directory based on the upload type
    const type = req.body.type || 'default';
    
    if (type === 'profile') {
      cb(null, profileImagesDir);
    } else if (type === 'post') {
      cb(null, postImagesDir);
    } else {
      cb(null, assetsDir);
    }
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

const uploadFile = upload.single('image');

export const uploadMedia = (req, res) => {
  uploadFile(req, res, function (err) {
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

    if (!req.file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Determine the type of upload
    const type = req.body.type || 'default';
    
    // Construct the appropriate URL path based on the upload type
    let fileUrl;
    if (type === 'profile') {
      fileUrl = `/assets/profileimage/${req.file.filename}`;
    } else if (type === 'post') {
      fileUrl = `/assets/postimage/${req.file.filename}`;
    } else {
      fileUrl = `/assets/${req.file.filename}`;
    }
    
    // Return the URL for the uploaded file in a format compatible with both the backend and frontend
    res.json({
      status: 'success',
      data: {
        imageUrl: fileUrl,
        message: 'File uploaded successfully'
      },
      // Add this for compatibility with the frontend's expected format
      imagePath: fileUrl
    });
  });
};
