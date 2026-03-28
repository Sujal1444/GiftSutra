import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/GiftSutra');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sujalversatileit_db_user:9y5IflR2UYlxRALi@giftsutra.l22qjh2.mongodb.net/GiftSutra');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
// 9y5IflR2UYlxRALi
export default connectDB;
