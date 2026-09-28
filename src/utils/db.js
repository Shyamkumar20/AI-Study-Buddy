const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Starting without database connectivity.");
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    console.warn("MongoDB connection failed. Starting without database connectivity.");
    console.warn(`MongoDB error: ${error.message}`);
    console.warn("Check the Atlas cluster status, Network Access IP allowlist, and DNS/VPN settings.");
  }
};

module.exports = connectDB;