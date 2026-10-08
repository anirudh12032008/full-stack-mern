import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { authenticate } from "./middleware/auth.js";
import { conn } from "./conn/conn.js";
import RequestRoutes from "./routes/RequestRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import LocationRoutes from "./routes/LocationRoutes.js";
import DriverRoutes from "./routes/DriverRoutes.js";
import SupervisorRoutes from "./routes/SupervisorRoutes.js"
import CareTakerRoutes from "./routes/CareTakerRoutes.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


conn();

app.use("/api/auth", AuthRoutes);
app.use("/api/user", authenticate, UserRoutes);
app.use("/api/emergency", authenticate, RequestRoutes);
app.use("/api/location", authenticate, LocationRoutes);
app.use("/api/driver", authenticate, DriverRoutes);
app.use("/api/supervisor", authenticate, SupervisorRoutes);
app.use("/api/caretaker", authenticate, CareTakerRoutes);



app.listen(process.env.PORT, () => {
  console.log(
    `Server Started On Port ${process.env.PORT}`
  );
});