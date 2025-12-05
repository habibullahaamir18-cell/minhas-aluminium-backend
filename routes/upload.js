import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer to use memory storage (not disk)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload endpoint with Cloudinary
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary using buffer
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'minhas-aluminium', // Organize uploads in a folder
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Failed to upload image' });
                }

                // Return the Cloudinary URL
                res.json({
                    filePath: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        // Pipe the buffer to Cloudinary
        uploadStream.end(req.file.buffer);

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;

