import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., CEO, Homeowner
    feedback: { type: String, required: true },
    image: { type: String }, // URL to image
    rating: { type: Number, default: 5, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Client', clientSchema);
