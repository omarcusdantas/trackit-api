import { Router } from "express";
import { validateAuth } from "../middlewares/validateAuth.js";
import { getHistory } from "../controllers/history.controller.js";

const historyRouter = Router();
historyRouter.get("/history", validateAuth, getHistory);

export default historyRouter;
