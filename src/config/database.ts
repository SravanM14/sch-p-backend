import mongoose from "mongoose";

const connectDataBase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

export default connectDataBase;