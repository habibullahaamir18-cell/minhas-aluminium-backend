import express from 'express';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';
import { deleteUploadedFiles, extractLocalImages } from '../utils/fileUtils.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create project (Protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.json(savedProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update project (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        // Get the old project to compare images
        const oldProject = await Project.findById(req.params.id);
        if (oldProject) {
            // Find images that were removed
            const oldImages = extractLocalImages(oldProject.images || []);
            const newImages = extractLocalImages(req.body.images || []);
            const removedImages = oldImages.filter(img => !newImages.includes(img));

            // Delete removed images from filesystem
            deleteUploadedFiles(removedImages);
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete project (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            // Delete all associated images
            const localImages = extractLocalImages(project.images || []);
            deleteUploadedFiles(localImages);
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
