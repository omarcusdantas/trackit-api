import { Request, Response } from "express";
import httpStatus from "http-status";
import { usersService } from "@/services/users.service";

async function updateData(req: Request, res: Response) {
    await usersService.updateData();
    return res.sendStatus(httpStatus.OK);
}

export const usersController = {
    updateData,
};
