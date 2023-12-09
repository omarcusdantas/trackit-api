import { Request, Response } from "express";
import httpStatus from "http-status";
import { dailyActivitiesService } from "@/services/dailyActivities.service";

async function get(req: Request, res: Response) {
    const { userId, utcOffset } = res.locals.user;
    const dailyActivities = await dailyActivitiesService.getByUserId(userId, utcOffset);

    return res.status(httpStatus.OK).send(dailyActivities);
}

async function update(req: Request, res: Response) {
    const { userId, utcOffset } = res.locals.user;
    const type = req.params.type;
    const habitId = parseInt(req.params.id);

    await dailyActivitiesService.updateByUserIdAndHabitId({ userId, utcOffset, habitId, type });
    return res.sendStatus(httpStatus.NO_CONTENT);
}

export const dailyActivitiesController = {
    get,
    update,
};
