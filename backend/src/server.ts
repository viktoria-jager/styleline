import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});