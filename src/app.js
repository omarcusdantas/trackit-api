import express from "express";
import cors from "cors";
import cron from "node-cron";
import { rateLimit } from "express-rate-limit";
import router from "./routes/index.routes.js";
import historyCron from "./cron/historyCron.js";
import dotenv from "dotenv";
dotenv.config();

// Limits each IP to 100 requests per 15 minutes.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

// Sets app to handle requests
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);
app.use(limiter);
// Error if IP reaches limit
app.use((err, req, res, next) => {
    if (err instanceof rateLimit.RateLimitExceeded) {
      return res.status(429).json({ error: "Too many requests, please try again later." });
    }
});

// Sets cron job to handle users' history once an hour
cron.schedule("0 * * * *", historyCron);

// Starts API
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running server on port ${PORT}`));