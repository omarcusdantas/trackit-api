import { Router } from "express";
import { signup } from "../controllers/authController.js";
import { validateSchema } from "../middlewares/validateSchema.js"
import { schemaSignup } from "../schemas/auth.schemas.js"

const authRouter = Router();
authRouter.post("/signup", validateSchema(schemaSignup), signup);

export default authRouter;