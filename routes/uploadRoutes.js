import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';

const router = express.Router();

// General upload endpoint (requires authentication)
router.post('/upload', uploadMedia);

// Dedicated endpoint for profile image uploads (no authentication required)
router.post('/profile', uploadMedia);

export default router;
