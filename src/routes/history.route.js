import { Router } from "express";
import validateAuth from "../middlewares/validateAuth.js";
import historyController from "../controllers/history.controller.js";

const historyRouter = Router();
historyRouter.get("/history", validateAuth, historyController.get);

export default historyRouter;
