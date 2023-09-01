import { Router } from "express";
import authRouter from "./auth.routes.js";
import updateRouter from "./update.routes.js";
import historyRouter from "./history.routes.js";
import habitsRouter from "./habits.routes.js";
import activitiesRouter from "./activities.routes.js";

const router = Router();
router.use(authRouter);
router.use(updateRouter);
router.use(historyRouter);
router.use(habitsRouter);
router.use(activitiesRouter);

export default router;
