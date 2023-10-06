import express from "express";
import "express-async-errors";
import cors from "cors";
import { MongoClient } from "mongodb";
import { rateLimit } from "express-rate-limit";
import errorHandler from "./middlewares/errorHandler.js";
import router from "./routes/index.routes.js";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;

// Cyclic requires that the connection with MongoDB is stablished before app.listen is called
try {
    await mongoClient.connect();
    console.log("MongoDB Connected!");
    db = mongoClient.db();

    const maxRequestsPerWindow = 200;
    const windowMinutes = 15;
    const minutesToMs = 60 * 1000;
    const limiter = rateLimit({
        windowMs: windowMinutes * minutesToMs,
        max: maxRequestsPerWindow,
    });

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(router);
    app.use(errorHandler);

    app.use(limiter);
    app.use((err, req, res, next) => {
        if (err instanceof rateLimit.RateLimitExceeded) {
            throw {
                type: "rateLimit",
                message: `Too many requests. Please try again after ${windowMinutes} minutes`,
            };
        }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
} catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
}
