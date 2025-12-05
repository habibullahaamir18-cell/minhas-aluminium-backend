import express from 'express';
import BusinessInfo from '../models/BusinessInfo.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get info
router.get('/', async (req, res) => {
    try {
        const info = await BusinessInfo.findOne();
        res.json(info || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update info (Protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        // Upsert: update if exists, insert if not
        const info = await BusinessInfo.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
