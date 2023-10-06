import { Router } from "express";
import validateAuth from "../middlewares/validateAuth.js";
import dailyActivitiesController from "../controllers/dailyActivities.controller.js";

const dailyActivitiesRouter = Router();
dailyActivitiesRouter.get("/daily-activities", validateAuth, dailyActivitiesController.get);
dailyActivitiesRouter.put("/daily-activities/:id/:type", validateAuth, dailyActivitiesController.update);

export default dailyActivitiesRouter;
