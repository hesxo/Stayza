import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URL = "mongodb+srv://hesxo:7GDEpuDdqmqiv7k1@cluster0.lcu2a3v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;