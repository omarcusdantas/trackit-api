import { Router } from "express";
import { updateUsers } from "../controllers/updateCrontroller.js";
import { validateUpdateAuth } from "../middlewares/validateUpdateAuth.js";

const updateRouter = Router();
updateRouter.post("/update", validateUpdateAuth, updateUsers);

export default updateRouter;