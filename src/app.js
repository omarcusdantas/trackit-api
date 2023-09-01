import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { rateLimit } from "express-rate-limit";
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

    // Limits each IP to 200 requests per 15 minutes
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
    });

    // Sets app to handle requests
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(router);
    app.use(limiter);
    // Error if IP reaches limit of requests
    app.use((err, req, res, next) => {
        if (err instanceof rateLimit.RateLimitExceeded) {
            return res.status(429).send("Too many requests, please try again after 15 minutes");
        }
    });

    // Starts API
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
} catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
}
