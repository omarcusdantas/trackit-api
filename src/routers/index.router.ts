import { Router } from "express";
import { authRouter } from "./auth.router";
import { usersRouter } from "./users.router";
import { historyRouter } from "./history.route";
import { habitsRouter } from "./habits.router";
import { dailyActivitiesRouter } from "./dailyActivities.router";

const router = Router();
router.use(authRouter);
router.use(usersRouter);
router.use(historyRouter);
router.use(habitsRouter);
router.use(dailyActivitiesRouter);

export { router };
