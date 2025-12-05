import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema({
    stats: [{
        label: String,
        value: Number,
        suffix: String
    }],
    contact: {
        phone: String,
        email: String,
        address: String,
        whatsapp: String,
        socials: {
            facebook: String,
            instagram: String,
            tiktok: String,
            mapLocation: String
        }
    },
    workingHours: [{
        day: String, // Monday, Tuesday, etc.
        isOpen: { type: Boolean, default: true },
        time: String // e.g., "9:00 AM - 6:00 PM"
    }],
    about: {
        // Basic Info
        yearsExperience: Number,
        projectsCompleted: Number,
        ceoName: String,
        ceoImage: String,

        // Story Section
        storyTitle: { type: String, default: 'Our Story' },
        storySubtitle: { type: String, default: 'From a small workshop in Rawalpindi to a nationwide leader in fabrication.' },
        storyImage: String,
        storyParagraph1: String,
        storyParagraph2: String,

        // Values/Features
        values: [{
            icon: String, // lucide icon name
            label: String
        }],

        // Timeline/Journey
        timeline: [{
            year: String,
            title: String,
            description: String
        }],

        // Shop/Workshop Images
        shopImages: [String]
    }
});

export default mongoose.model('BusinessInfo', businessInfoSchema);
