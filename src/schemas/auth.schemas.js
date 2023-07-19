import joi from "joi";
import JoiTimezone from "joi-tz";

const joiTZ = joi.extend(JoiTimezone);

export const schemaSignup = joi.object({
    name: joi.string().min(2).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(20).required(),
    timezone: joiTZ.timezone().required(),
});

export const schemaSignin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});