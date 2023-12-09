import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { ErrorWithMessage } from "@/protocols/error.protocol";

export function errorHandler(error: ErrorWithMessage, req: Request, res: Response, next: NextFunction): Response {
    console.log(error);
    switch (error.type) {
        case "conflict":
            return res.status(httpStatus.CONFLICT).send(error.message);
        case "unauthorized":
            return res.status(httpStatus.UNAUTHORIZED).send(error.message);
        case "notFound":
            return res.status(httpStatus.NOT_FOUND).send(error.message);
        case "badRequest":
            return res.status(httpStatus.BAD_REQUEST).send(error.message);
        case "unprocessable":
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).send(error.message);
        case "rateLimit":
            return res.status(httpStatus.TOO_MANY_REQUESTS).send(error.message);
        case "internal":
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        default:
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Something went wrong. Try again later.");
    }
}
