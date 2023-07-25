import { Router } from "express";
import { signup, signin } from "../controllers/authController.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaSignup, schemaSignin } from "../schemas/auth.schemas.js";

const authRouter = Router();
authRouter.post("/signup", validateSchema(schemaSignup), signup);
authRouter.post("/signin", validateSchema(schemaSignin), signin);

export default authRouter;
