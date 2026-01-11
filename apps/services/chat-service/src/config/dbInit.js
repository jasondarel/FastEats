import mongoose from 'mongoose';
import logger from './loggerInit.js';
import envInit from './envInit.js';

envInit();

const dbName = process.env.MONGO_DB_NAME;
const mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || '27017'}/${dbName}?authSource=admin`;

mongoose.set('strictQuery', false);

const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info(`✅ Successfully connected to MongoDB database: ${dbName}`);
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

const testDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDatabase();
    }
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`✅ MongoDB connection test successful at: ${formattedDate}`);
  } catch (error) {
    logger.error('❌ MongoDB connection test failed:', error);
    throw error;
  }
};

const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed.');
  } catch (error) {
    logger.error('Error closing Mongoose connection:', error);
  }
};

export { connectDatabase, testDatabase, closeDatabase };
export default mongoose;