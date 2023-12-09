import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function validateAuth(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
        throw { type: "unauthorized", message: "No token provided" };
    }

    try {
        const { userId, utcOffset } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        res.locals.user = {
            userId: userId,
            utcOffset: utcOffset,
        };

        next();
    } catch (error) {
        throw { type: "unauthorized", message: "Invalid token" };
    }
}

type JWTPayload = {
    userId: number;
    utcOffset: number;
};
