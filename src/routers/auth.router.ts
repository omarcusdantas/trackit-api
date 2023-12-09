import { Router } from "express";
import { authController } from "@/controllers/auth.controller";
import { validateSchema } from "@/middlewares/validateSchema";
import { schemaSignup, schemaSignin } from "@/schemas/auth.schemas";

const authRouter = Router();
authRouter.post("/signup", validateSchema(schemaSignup), authController.signup);
authRouter.post("/signin", validateSchema(schemaSignin), authController.signin);

export { authRouter };
