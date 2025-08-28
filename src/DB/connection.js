import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/TapTalk";
    const result = await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log(result.models);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
