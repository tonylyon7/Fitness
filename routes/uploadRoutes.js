const express = require('express');
const router = express.Router();
const { uploadMedia } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Protected route - only authenticated users can upload
router.post('/upload', protect, uploadMedia);

module.exports = router;
