import { Request, Response } from "express";
import httpStatus from "http-status";
import { authService } from "@/services/auth.service";
import { SignupData, SigninData } from "@/protocols/auth.protocol.js";

async function signup(req: Request, res: Response) {
    const body = req.body as SignupData;

    await authService.createUser(body);
    res.sendStatus(httpStatus.CREATED);
}

async function signin(req: Request, res: Response) {
    const { email, password } = req.body as SigninData;

    const token = await authService.generateToken(email, password);
    res.status(httpStatus.OK).send(token);
}

export const authController = {
    signup,
    signin,
};
