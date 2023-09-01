import { Router } from "express";
import { validateAuth } from "../middlewares/validateAuth.js";
import { getDailyHabits, trackHabit } from "../controllers/activities.controller.js";

const activitiesRouter = Router();
activitiesRouter.get("/daily-habits", validateAuth, getDailyHabits);
activitiesRouter.put("/daily-habits/:id/:type", validateAuth, trackHabit);

export default activitiesRouter;
