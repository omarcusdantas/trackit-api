import { Router } from "express";
import { validateUpdateAuth } from "@/middlewares/validateUpdateUsersAuth";
import { usersController } from "@/controllers/users.controller";

const usersRouter = Router();
// Runs every hour by Cyclic cron job. This was made as a route because Cyclic free tier doesn't support internal cron job
usersRouter.post("/users/update", validateUpdateAuth, usersController.updateData);

export { usersRouter };
