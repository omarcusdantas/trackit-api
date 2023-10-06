import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import validateSchema from "../middlewares/validateSchema.js";
import { schemaSignup, schemaSignin } from "../schemas/auth.schemas.js";

const authRouter = Router();
authRouter.post("/signup", validateSchema(schemaSignup), authController.signup);
authRouter.post("/signin", validateSchema(schemaSignin), authController.signin);

export default authRouter;
