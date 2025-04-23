import express from 'express';
import { checkUsername } from '../controllers/username.controller.js';

const router = express.Router();

// Check if a username is available
router.get('/check/:username', checkUsername);

export default router;
