import { Router } from "express";
import { validateAuth } from "../middlewares/validateAuth.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { addHabit, getHabits, deleteHabit } from "../controllers/userController.js";
import { schemaHabit } from "../schemas/user.schemas.js";

const userRouter = Router();
userRouter.post("/habits", validateAuth, validateSchema(schemaHabit), addHabit);
userRouter.get("/habits", validateAuth, getHabits);
userRouter.delete("/delete-habit/:id", validateAuth, deleteHabit);

export default userRouter;