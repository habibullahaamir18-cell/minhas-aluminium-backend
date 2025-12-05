import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // Facades, Residential, Shopfronts, Interior
    location: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // URLs to images
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);
