import express from 'express';
import { 
  uploadMedia, 
  uploadProfileImage, 
  uploadPostMedia, 
  uploadProductImage, 
  uploadCoachImage 
} from '../controllers/uploadController.js';

const router = express.Router();

// General upload endpoint (requires authentication)
router.post('/upload', uploadMedia);

// Dedicated endpoints for different types of uploads (no authentication required)
router.post('/profile', uploadProfileImage); // For profile pictures
router.post('/post', uploadPostMedia);       // For post images/videos
router.post('/product', uploadProductImage); // For product images
router.post('/coach', uploadCoachImage);     // For coach profile images

export default router;
