import joi from "joi";

export const schemaHabit = joi.object({
    name: joi.string().min(2).max(100).required(),
    days: joi.array().unique().items(joi.number().integer().min(0).max(6)).required(),
});
