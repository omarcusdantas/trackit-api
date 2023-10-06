import httpStatus from "http-status";
import habitsService from "../services/habits.service.js";

async function create(req, res) {
    const { userId, utcOffset } = res.locals.user;
    const { name, days } = req.body;
    await habitsService.create(userId, utcOffset, name, days);
    return res.sendStatus(httpStatus.CREATED);
}

async function get(req, res) {
    const { userId } = res.locals.user;
    const userHabits = await habitsService.getByUserId(userId);
    return res.status(httpStatus.OK).send(userHabits);
}

async function deleteHabit(req, res) {
    const id = parseInt(req.params.id);
    const { userId, utcOffset } = res.locals.user;
    await habitsService.deleteByHabitId(userId, utcOffset, id);
    return res.sendStatus(httpStatus.NO_CONTENT);
}

const habitsController = {
    create,
    get,
    deleteHabit,
};
export default habitsController;
