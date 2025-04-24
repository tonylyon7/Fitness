import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';

const router = express.Router();

// General upload endpoint (requires authentication)
router.post('/upload', uploadMedia);

// Dedicated endpoints for different types of uploads (no authentication required)
router.post('/profile', uploadMedia); // For profile pictures
router.post('/post', uploadMedia);     // For post images/videos
router.post('/product', uploadMedia);  // For product images
router.post('/coach', uploadMedia);    // For coach profile images

export default router;
