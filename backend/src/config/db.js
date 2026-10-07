import mongoose from 'mongoose';

export const connectDB = async () => {
  const connUri = process.env.MONGO_URI || 'mongodb://localhost:27017/github-assistant';
  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed (${error.message}). Running in mock memory database mode.`);
    return false;
  }
};
