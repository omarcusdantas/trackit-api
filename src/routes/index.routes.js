import { Router } from "express";
import authRouter from "./auth.route.js";
import updateRouter from "./update.route.js";
import historyRouter from "./history.route.js";
import habitsRouter from "./habits.route.js";
import dailyActivitiesRouter from "./dailyActivities.route.js";

const router = Router();
router.use(authRouter);
router.use(updateRouter);
router.use(historyRouter);
router.use(habitsRouter);
router.use(dailyActivitiesRouter);

export default router;
