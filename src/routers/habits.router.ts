import { Router } from "express";
import { validateAuth } from "@/middlewares/validateAuth";
import { validateSchema } from "@/middlewares/validateSchema";
import { schemaHabit } from "@/schemas/habits.schemas";
import { habitsController } from "@/controllers/habits.controller";

const habitsRouter = Router();
habitsRouter.post("/habits", validateAuth, validateSchema(schemaHabit), habitsController.create);
habitsRouter.get("/habits", validateAuth, habitsController.get);
habitsRouter.delete("/habits/:id", validateAuth, habitsController.deleteHabit);

export { habitsRouter };
