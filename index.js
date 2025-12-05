import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import infoRoutes from './routes/info.js';
import uploadRoutes from './routes/upload.js';
import serviceRoutes from './routes/services.js';
import clientRoutes from './routes/clients.js';

// Models
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
const allowedOrigins = [
    'https://minhas-aluminium-nqd6.vercel.app',
    'https://minhas-aluminium-oq61.vercel.app',
    'https://minhas-aluminium.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minhas_db';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected Successfully');

        // Create default admin if doesn't exist
        try {
            const existingAdmin = await User.findOne({ username: 'Aamir' });
            if (!existingAdmin) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('minhas666021', salt);
                const newAdmin = new User({
                    username: 'Aamir',
                    password: hashedPassword,
                    role: 'admin'
                });
                await newAdmin.save();
                console.log('✅ Default admin user created (Aamir/minhas666021)');
            }
        } catch (err) {
            console.log('ℹ️  Admin user setup:', err.message);
        }
    })
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
    res.send('Minhas Aluminium & Glass API is running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
