import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import updateRouter from "./update.routes.js";

const router = Router();
router.use(authRouter);
router.use(userRouter);
router.use(updateRouter);

export default router;
