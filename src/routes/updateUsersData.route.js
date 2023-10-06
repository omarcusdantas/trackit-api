// Runs every hour by Cyclic cron job. This was made as a route because Cyclic free tier doesn't support internal cron job

import { Router } from "express";
import updateController from "../controllers/update.controller.js";
import validateUpdateAuth from "../middlewares/validateUpdateAuth.js";

const updateUsersDataRouter = Router();
updateUsersDataRouter.post("/update", validateUpdateAuth, updateController.updateUsersData);

export default updateUsersDataRouter;
