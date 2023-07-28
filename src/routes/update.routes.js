import { Router } from "express";
import { updateUsers } from "../controllers/updateCrontroller.js";

const updateRouter = Router();
updateRouter.post("/update", updateUsers);

export default updateRouter;