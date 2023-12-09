import express, { Request, Response } from "express";
import "express-async-errors";
import httpStatus from "http-status";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { limiter, rateLimiter } from "./middlewares/rateLimiter";
import { router } from "./routers/index.router";

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorHandler);
app.use(limiter);
app.use(rateLimiter);

app.get('/health', (req: Request, res: Response) => {
    res.status(httpStatus.OK).send("I'm ok!");
});

export { app };
