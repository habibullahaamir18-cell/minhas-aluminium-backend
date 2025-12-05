import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import Project from './models/Project.js';
import Client from './models/Client.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minhas_db';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

/**
 * Extract filename from URL or path
 */
const extractFilename = (url) => {
    if (!url) return null;

    // Handle full URLs
    if (url.includes('http://') || url.includes('https://')) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.replace(/^\/uploads\//, '');
        } catch {
            return null;
        }
    }

    // Handle relative paths
    return url.replace(/^\/uploads\//, '');
};

/**
 * Get all image filenames referenced in the database
 */
const getReferencedImages = async () => {
    const referencedImages = new Set();

    // Get all services
    const services = await Service.find();
    services.forEach(service => {
        if (service.images && Array.isArray(service.images)) {
            service.images.forEach(img => {
                const filename = extractFilename(img);
                if (filename && !filename.includes('unsplash') && !filename.includes('http')) {
                    referencedImages.add(filename);
                }
            });
        }
    });

    // Get all projects
    const projects = await Project.find();
    projects.forEach(project => {
        if (project.images && Array.isArray(project.images)) {
            project.images.forEach(img => {
                const filename = extractFilename(img);
                if (filename && !filename.includes('unsplash') && !filename.includes('http')) {
                    referencedImages.add(filename);
                }
            });
        }
    });

    // Get all clients
    const clients = await Client.find();
    clients.forEach(client => {
        if (client.image) {
            const filename = extractFilename(client.image);
            if (filename && !filename.includes('unsplash') && !filename.includes('http')) {
                referencedImages.add(filename);
            }
        }
    });

    return referencedImages;
};

/**
 * Get all files in the uploads directory
 */
const getUploadedFiles = () => {
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.log('📁 Uploads directory does not exist.');
        return [];
    }

    return fs.readdirSync(UPLOADS_DIR).filter(file => {
        const filePath = path.join(UPLOADS_DIR, file);
        return fs.statSync(filePath).isFile();
    });
};

/**
 * Main cleanup function
 */
const cleanupUnusedImages = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Scanning database for referenced images...');
        const referencedImages = await getReferencedImages();
        console.log(`📊 Found ${referencedImages.size} referenced images in database\n`);

        console.log('📂 Scanning uploads directory...');
        const uploadedFiles = getUploadedFiles();
        console.log(`📊 Found ${uploadedFiles.length} files in uploads directory\n`);

        // Find unused files
        const unusedFiles = uploadedFiles.filter(file => !referencedImages.has(file));

        if (unusedFiles.length === 0) {
            console.log('✨ No unused images found! Your uploads folder is clean.\n');
        } else {
            console.log(`🗑️  Found ${unusedFiles.length} unused images:\n`);

            let totalSize = 0;
            unusedFiles.forEach(file => {
                const filePath = path.join(UPLOADS_DIR, file);
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                totalSize += stats.size;
                console.log(`   - ${file} (${sizeKB} KB)`);
            });

            console.log(`\n💾 Total space to be freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

            // Delete unused files
            console.log('🗑️  Deleting unused images...');
            let deletedCount = 0;
            unusedFiles.forEach(file => {
                try {
                    const filePath = path.join(UPLOADS_DIR, file);
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (err) {
                    console.error(`   ❌ Failed to delete ${file}:`, err.message);
                }
            });

            console.log(`✅ Successfully deleted ${deletedCount} unused images\n`);
        }

        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

// Run the cleanup
cleanupUnusedImages();
