import { Router } from "express";
import { validateAuth } from "../middlewares/validateAuth.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { addHabit, getHabits, deleteHabit } from "../controllers/habits.controller.js";
import { schemaHabit } from "../schemas/user.schemas.js";

const habitsRouter = Router();
habitsRouter.post("/habits", validateAuth, validateSchema(schemaHabit), addHabit);
habitsRouter.get("/habits", validateAuth, getHabits);
habitsRouter.delete("/habits/:id", validateAuth, deleteHabit);

export default habitsRouter;
