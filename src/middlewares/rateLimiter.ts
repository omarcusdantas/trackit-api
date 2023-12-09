import { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";

const maxRequestsPerWindow = 200;
const windowMinutes = 15;
const minutesToMs = 60 * 1000;

export const limiter = rateLimit({
    windowMs: windowMinutes * minutesToMs,
    max: maxRequestsPerWindow,
});

export function rateLimiter(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof rateLimit) {
        throw {
            type: "rateLimit",
            message: `Too many requests. Please try again after ${windowMinutes} minutes`,
        };
    }
}
