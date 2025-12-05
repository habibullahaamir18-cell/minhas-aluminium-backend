import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import BusinessInfo from './models/BusinessInfo.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/minhas_db';
        console.log('Connecting to MongoDB...');

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Delete old admin if exists
        await User.deleteOne({ username: 'admin' });
        console.log('🗑️  Old admin user deleted (if existed)');

        // Check if new admin exists
        const existingAdmin = await User.findOne({ username: 'Aamir' });
        if (existingAdmin) {
            console.log('ℹ️  User "Aamir" already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash('minhas666021', salt);
            await existingAdmin.save();
            console.log('✅ Password updated for "Aamir"');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('minhas666021', salt);

            const newAdmin = new User({
                username: 'Aamir',
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            console.log('✅ Admin user "Aamir" created successfully!');
        }

        // Seed Business Info
        const existingInfo = await BusinessInfo.findOne();
        if (!existingInfo) {
            const newInfo = new BusinessInfo({
                stats: [
                    { label: 'Years of Experience', value: 16, suffix: '+' },
                    { label: 'Projects Completed', value: 450, suffix: '+' },
                    { label: 'Happy Clients', value: 300, suffix: '+' }
                ],
                contact: {
                    phone: '+92 300 1234567',
                    email: 'info@minhascorp.com',
                    address: 'Plot # 12, Industrial Area, Rawalpindi, Pakistan',
                    whatsapp: '+923001234567',
                    socials: {
                        facebook: 'https://facebook.com',
                        instagram: 'https://instagram.com',
                        tiktok: 'https://tiktok.com',
                        mapLocation: 'https://maps.google.com'
                    }
                },
                workingHours: [
                    { day: 'Monday', isOpen: true, time: '9:00 AM - 6:00 PM' },
                    { day: 'Tuesday', isOpen: true, time: '9:00 AM - 6:00 PM' },
                    { day: 'Wednesday', isOpen: true, time: '9:00 AM - 6:00 PM' },
                    { day: 'Thursday', isOpen: true, time: '9:00 AM - 6:00 PM' },
                    { day: 'Friday', isOpen: true, time: '9:00 AM - 1:00 PM' },
                    { day: 'Sunday', isOpen: false, time: '' }
                ],
                about: {
                    yearsExperience: 16,
                    projectsCompleted: 450,
                    ceoName: 'Ahmed Minhas',
                    storyTitle: 'Our Story',
                    storySubtitle: 'From a small workshop to a leader in fabrication.',
                    storyParagraph1: 'Minhas Aluminium & Glass Corp started with a vision to provide high-quality fabrication solutions.',
                    storyParagraph2: 'We have grown to serve clients across the nation with dedication and precision.',
                    values: [
                        { icon: 'Award', label: 'Quality Certified' },
                        { icon: 'Users', label: 'Expert Team' },
                        { icon: 'TrendingUp', label: 'Modern Tech' },
                        { icon: 'Clock', label: 'On-time Delivery' }
                    ],
                    timeline: [
                        { year: '2009', title: 'Foundation', description: 'Started as a small workshop.' },
                        { year: '2014', title: 'Expansion', description: 'Moved to a larger facility.' },
                        { year: '2019', title: 'Modernization', description: 'Imported new machinery.' },
                        { year: '2023', title: 'Nationwide', description: 'Serving clients across Pakistan.' }
                    ]
                }
            });
            await newInfo.save();
            console.log('✅ Business Info seeded successfully!');
        } else {
            console.log('ℹ️  Business Info already exists. Updating...');
            existingInfo.contact.phone = '+92 332 6666021';
            existingInfo.contact.whatsapp = '+92 332 6666021';
            await existingInfo.save();
            console.log('✅ Business Info updated: Phone and WhatsApp synced.');
        }

        console.log('   Username: Aamir');
        console.log('   Password: minhas666021');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();
