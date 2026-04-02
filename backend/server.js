import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import { connectCloudinary } from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import popupRoute from "./routes/popupRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
// import restaurantReviewRoute from "./routes/restaurantReviewRoute.js"; // COMMENTED OUT - legacy restaurant review module
import newsletterRouter from "./routes/newsletterRoute.js"; // Import newsletter route
import imageRouter from "./routes/imageRoute.js"; // Import image route
import categoryRouter from "./routes/categoryRoute.js";
import depositRouter from "./routes/depositRoute.js"; // Import deposit route
import purchaseRouter from "./routes/purchaseRoute.js"; // Import purchase route

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/newsletter", newsletterRouter); // Add newsletter route
app.use("/api/popup", popupRoute);
app.use("/api/review", reviewRouter);
// app.use("/api/restaurant-review", restaurantReviewRoute); // COMMENTED OUT - legacy restaurant review endpoints
app.use("/api/images", imageRouter); // Add image route
app.use("/api/categories", categoryRouter);
app.use("/api/deposit", depositRouter); // Add deposit route
app.use("/api/purchase", purchaseRouter); // Add purchase route

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("Server started on PORT : " + port));
