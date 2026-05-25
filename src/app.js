import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          env.clientUrl, 
          "http://localhost:5173", 
          "http://localhost:5174", 
          "http://localhost:5175"
        ];
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Match local network IPs (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x, localhost) with ports
        const isLocalIp = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
        if (isLocalIp) {
          return callback(null, true);
        }
        
        return callback(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
    })
  );
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(mongoSanitize());
  app.use(morgan("dev"));
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    if (req.query.download) {
      const filename = req.query.filename || "file";
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    }
    next();
  }, express.static(path.join(__dirname, "../uploads")));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/messages", chatRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
