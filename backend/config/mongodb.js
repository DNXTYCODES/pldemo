import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("DB Connected");
  });

  await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`, {
    retryWrites: false,
    authSource: "admin",
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
};

export default connectDB;
