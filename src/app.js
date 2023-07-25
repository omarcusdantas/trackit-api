import express from "express";
import cors from "cors";
import cron from "node-cron";
import router from "./routes/index.routes.js";
import historyCron from "./cron/historyCron.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

cron.schedule("0 * * * *", historyCron);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
