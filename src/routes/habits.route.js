import { Router } from "express";
import habitsController from "../controllers/habits.controller.js";
import validateAuth from "../middlewares/validateAuth.js";
import validateSchema from "../middlewares/validateSchema.js";
import { schemaHabit } from "../schemas/user.schemas.js";

const habitsRouter = Router();
habitsRouter.post("/habits", validateAuth, validateSchema(schemaHabit), habitsController.create);
habitsRouter.get("/habits", validateAuth, habitsController.get);
habitsRouter.delete("/habits/:id", validateAuth, habitsController.deleteHabit);

export default habitsRouter;
