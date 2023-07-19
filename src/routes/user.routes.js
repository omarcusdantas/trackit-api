import { Router } from "express";
import { validateAuth } from "../middlewares/validateAuth.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { addHabit } from "../controllers/userController.js";
import { schemaHabit } from "../schemas/user.schemas.js";

const userRouter = Router();
userRouter.post("/habits", validateAuth, validateSchema(schemaHabit), addHabit);

export default userRouter;