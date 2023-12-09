import { Request, Response } from "express";
import httpStatus from "http-status";
import habitsService from "@/services/habits.service";
import { HabitInput } from "@/protocols/habits.protocol";

async function create(req: Request, res: Response) {
    const { userId, utcOffset } = res.locals.user;
    const body = req.body as HabitInput;

    await habitsService.create(body, userId, utcOffset );
    return res.sendStatus(httpStatus.CREATED);
}

async function get(req: Request, res: Response) {
    const { userId } = res.locals.user;

    const userHabits = await habitsService.getByUserId(userId);
    return res.status(httpStatus.OK).send(userHabits);
}

async function deleteHabit(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { userId, utcOffset } = res.locals.user;

    await habitsService.deleteById(userId, utcOffset, id);
    return res.sendStatus(httpStatus.NO_CONTENT);
}

export const habitsController = {
    create,
    get,
    deleteHabit,
};
