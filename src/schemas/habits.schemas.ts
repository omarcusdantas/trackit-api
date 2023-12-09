import joi from "joi";
import { HabitInput } from "@/protocols/habits.protocol";

export const schemaHabit = joi.object<HabitInput>({
    name: joi.string().min(2).max(100).required(),
    days: joi.array().unique().items(joi.number().integer().min(0).max(6)).required(),
});
