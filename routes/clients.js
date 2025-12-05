import express from 'express';
import Client from '../models/Client.js';
import { verifyToken } from '../middleware/auth.js';
import { deleteUploadedFile, extractLocalImages } from '../utils/fileUtils.js';

const router = express.Router();

// Get all clients (Public)
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create client (Protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newClient = new Client(req.body);
        const savedClient = await newClient.save();
        res.status(201).json(savedClient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update client (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        // Get the old client to compare image
        const oldClient = await Client.findById(req.params.id);
        if (oldClient && oldClient.image) {
            // Check if image was changed
            const oldImage = oldClient.image;
            const newImage = req.body.image;

            // If image changed and old image is local, delete it
            if (oldImage !== newImage && extractLocalImages([oldImage]).length > 0) {
                deleteUploadedFile(oldImage);
            }
        }

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete client (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (client && client.image) {
            // Delete associated image if it's local
            const localImages = extractLocalImages([client.image]);
            if (localImages.length > 0) {
                deleteUploadedFile(client.image);
            }
        }

        await Client.findByIdAndDelete(req.params.id);
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
