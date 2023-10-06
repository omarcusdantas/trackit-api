import joi from "joi";

export const schemaSignup = joi.object({
    name: joi.string().min(2).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(20).required(),
    utcOffset: joi.number().integer().min(-12).max(14).required(),
});

export const schemaSignin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});
