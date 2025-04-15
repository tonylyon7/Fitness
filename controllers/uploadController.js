const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const uploadFile = upload.single('image');

exports.uploadMedia = (req, res) => {
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

    // Return the URL for the uploaded file
    const fileUrl = `/assets/${req.file.filename}`;
    res.json({
      status: 'success',
      data: {
        imageUrl: fileUrl,
        message: 'File uploaded successfully'
      }
    });
  });
};
