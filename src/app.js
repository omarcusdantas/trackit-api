import express from "express";
import cors from "cors";
import cron from "node-cron";
import router from "./routes/index.routes.js";
import historyCron from "./cron/historyCron.js";
import dotenv from "dotenv";
dotenv.config();

// Sets app to handle requests
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

// Sets cron job to handle users' history once an hour
cron.schedule("0 * * * *", historyCron);

// Starts API
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
