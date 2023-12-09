import { NextFunction, Request, Response } from "express";

export function validateUpdateAuth(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    const updatePass = authorization?.replace("Bearer ", "");

    if (!updatePass || updatePass !== process.env.UPDATE_USERS_KEY) {
        throw { type: "unauthorized", message: "Invalid token" };
    }

    next();
}
