import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import labRouter from "./routes/lab.routes";
import staffhubRouter from "./routes/staffhub.routes";
import workshopRouter from "./routes/workshop.routes";

import { rateLimit } from "express-rate-limit";

const app = express();

// When running behind a proxy (nginx in docker-compose), Express must
// trust the proxy to accept `X-Forwarded-*` headers.
const trustProxyEnv = process.env.TRUST_PROXY;
if (typeof trustProxyEnv !== "undefined") {
  const parsed = Number(trustProxyEnv);
  const val = trustProxyEnv === "true" ? true : trustProxyEnv === "false" ? false : Number.isInteger(parsed) ? parsed : trustProxyEnv;
  app.set("trust proxy", val as any);
} else {
  app.set("trust proxy", 1);
}

app.use(helmet({ contentSecurityPolicy: false }));

// Whitelist of allowed CORS origins
const ALLOWED_ORIGINS = [
  "http://localhost",
  "http://localhost:3000",
  "http://127.0.0.1",
  "http://127.0.0.1:3000"
];

// Support credentials in CORS (critical for cookie sharing)
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[Security Alert] CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  }, 
  credentials: true 
}));

// Rate limiting configurations
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 login attempts per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again after 15 minutes." },
  handler: (req, res, next, options) => {
    console.warn(`[Security Alert] Login rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Apply rate limiters
app.use("/api", globalLimiter);
app.use("/api/app/login", loginLimiter);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use("/api/lab", labRouter);
app.use("/api/app", staffhubRouter);
app.use("/api/simulate", workshopRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
