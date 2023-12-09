import { Router } from "express";
import { validateAuth } from "@/middlewares/validateAuth";
import { dailyActivitiesController } from "@/controllers/dailyActivities.controller";

const dailyActivitiesRouter = Router();
dailyActivitiesRouter.get("/daily-activities", validateAuth, dailyActivitiesController.get);
dailyActivitiesRouter.put("/daily-activities/:id/:type", validateAuth, dailyActivitiesController.update);

export { dailyActivitiesRouter };
