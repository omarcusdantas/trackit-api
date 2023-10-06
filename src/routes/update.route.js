import { Router } from "express";
import updateController from "../controllers/update.controller.js";
import validateUpdateAuth from "../middlewares/validateUpdateAuth.js";

const updateRouter = Router();
updateRouter.post("/update", validateUpdateAuth, updateController.updateUsersData);

export default updateRouter;
