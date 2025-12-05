import express from 'express';
import Service from '../models/Service.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { deleteUploadedFiles, extractLocalImages } from '../utils/fileUtils.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create service (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const service = new Service(req.body);
    try {
        const newService = await service.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update service (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        // Get the old service to compare images
        const oldService = await Service.findById(req.params.id);
        if (oldService) {
            // Find images that were removed
            const oldImages = extractLocalImages(oldService.images || []);
            const newImages = extractLocalImages(req.body.images || []);
            const removedImages = oldImages.filter(img => !newImages.includes(img));

            // Delete removed images from filesystem
            deleteUploadedFiles(removedImages);
        }

        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete service (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            // Delete all associated images
            const localImages = extractLocalImages(service.images || []);
            deleteUploadedFiles(localImages);
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
