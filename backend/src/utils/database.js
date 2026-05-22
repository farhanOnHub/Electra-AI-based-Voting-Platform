import mongoose from 'mongoose';
import config from '../config/index.js';

let dbConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
    dbConnected = true;
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('⚠️  MongoDB not available. Application will run in demo mode without database persistence.');
    console.log('⚠️  To fix this, install MongoDB or configure MONGO_URI in .env file.');
    dbConnected = false;
    // Don't exit, allow application to run in demo mode
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    dbConnected = false;
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

export const isDBConnected = () => dbConnected;
