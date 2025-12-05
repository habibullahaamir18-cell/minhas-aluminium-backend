import mongoose from 'mongoose';
import BusinessInfo from './models/BusinessInfo.js';
import dotenv from 'dotenv';

dotenv.config();

const checkInfo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/minhas_db');
        const count = await BusinessInfo.countDocuments();
        console.log(`BusinessInfo count: ${count}`);
        if (count > 0) {
            const info = await BusinessInfo.findOne();
            console.log('Working Hours:', info.workingHours);
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        await mongoose.connection.close();
    }
};

checkInfo();
