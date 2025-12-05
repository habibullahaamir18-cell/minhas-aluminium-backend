import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Lucide icon name
    details: { type: String, required: true },
    features: [String],
    qualitySpecs: String,
    images: [String]
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
