import { Router } from "express";
import { validateAuth } from "@/middlewares/validateAuth";
import { historyController } from "@/controllers/history.controller";

const historyRouter = Router();
historyRouter.get("/history", validateAuth, historyController.get);

export { historyRouter };
