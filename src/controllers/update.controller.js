import httpStatus from "http-status";
import updateService from "../services/update.service.js";

async function updateUsersData(req, res) {
    await updateService.updateUsersData();
    return res.sendStatus(httpStatus.OK);
}

const updateController = {
    updateUsersData,
};
export default updateController;
