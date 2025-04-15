import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';

const router = express.Router();

// Allow any user to upload for now
router.post('/upload', uploadMedia);

export default router;
