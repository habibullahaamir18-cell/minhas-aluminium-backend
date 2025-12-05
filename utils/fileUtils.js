import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Delete a file from the uploads directory
 * @param {string} filePath - The file path (e.g., "/uploads/image-123.jpg" or "http://localhost:5000/uploads/image-123.jpg")
 */
export const deleteUploadedFile = (filePath) => {
    try {
        if (!filePath) return;

        // Extract just the filename from the path
        let filename = filePath;

        // Handle full URLs
        if (filePath.includes('http://') || filePath.includes('https://')) {
            const url = new URL(filePath);
            filename = url.pathname;
        }

        // Remove leading /uploads/ if present
        filename = filename.replace(/^\/uploads\//, '');

        // Construct the full file path
        const fullPath = path.join(__dirname, '../uploads', filename);

        // Check if file exists and delete it
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`✅ Deleted file: ${filename}`);
        }
    } catch (err) {
        console.error(`❌ Error deleting file ${filePath}:`, err.message);
    }
};

/**
 * Delete multiple files from the uploads directory
 * @param {string[]} filePaths - Array of file paths
 */
export const deleteUploadedFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) return;
    filePaths.forEach(filePath => deleteUploadedFile(filePath));
};

/**
 * Extract local uploaded files from an array of image URLs
 * (filters out external URLs like unsplash.com)
 * @param {string[]} images - Array of image URLs
 * @returns {string[]} - Array of local file paths
 */
export const extractLocalImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.filter(img =>
        img &&
        (img.includes('/uploads/') || img.startsWith('http://localhost'))
    );
};
