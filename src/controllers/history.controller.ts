import { Request, Response } from "express";
import httpStatus from "http-status";
import { historyService } from "@/services/history.service";

async function get(req: Request, res: Response) {
    const { userId } = res.locals.user;

    const userRecentHistory = await historyService.getByUserId(userId);
    return res.status(httpStatus.OK).send(userRecentHistory);
}

export const historyController = {
    get,
};
