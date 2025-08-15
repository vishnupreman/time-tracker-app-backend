import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { connectDB } from "./config/db";
import dashboardRoute from "./routes/dashboardRoute";
import projectRoutes from './routes/projectRoutes'
import taskRoutes from './routes/taskRoutes'
import timerRoutes from './routes/timerRoutes'
dotenv.config();
const app = express();
connectDB();

app.use(cors({
  origin: "https://time-tracker-app-frontend.vercel.app", 
  credentials: true
}));
// app.use(cors({
//   origin: "http://localhost:5173", 
//   credentials: true
// }));
app.use(express.json());
app.use(cookieParser());

console.log('Testing...')

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/projects", projectRoutes);
app.use('/api/tasks',taskRoutes)
app.use('/api/timer',timerRoutes)
app.get("/", (req, res) => res.send("Time Tracker API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
