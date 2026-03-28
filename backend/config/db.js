import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/GiftSutra');
    // const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Darshan:Versatile@darshanversatile.zcu55.mongodb.net/GiftSutra');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
