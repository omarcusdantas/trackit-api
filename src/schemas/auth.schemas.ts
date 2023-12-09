import joi from "joi";
import { SignupData, SigninData } from "@/protocols/auth.protocol";

export const schemaSignup = joi.object<SignupData>({
    name: joi.string().min(2).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(20).required(),
    utcOffset: joi.number().integer().min(-12).max(14).required(),
});

export const schemaSignin = joi.object<SigninData>({
    email: joi.string().email().required(),
    password: joi.string().required(),
});
