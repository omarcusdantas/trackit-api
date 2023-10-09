import httpStatus from "http-status";
import historyService from "../services/history.service.js";

async function get(req, res) {
    const { userId } = res.locals.user;
    const userRecentHistory = await historyService.getByUserId(userId);
    return res.status(httpStatus.OK).send(userRecentHistory);
}

const historyController = {
    get,
};
export default historyController;
