import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import cardRoutes from "./routes/card.route.js";
import benefitsRoutes from "./routes/benefits.routes.js";
import { FRONTEND_URL } from "./config.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", userRoutes);
app.use("/api", sessionRoutes);
app.use("/api", cardRoutes);
app.use("/api", benefitsRoutes);

export default app;
