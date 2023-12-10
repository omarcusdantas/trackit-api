import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { stripHtml } from "string-strip-html";
import { authRepository } from "@/repositories/auth.repository";
import { getWeekdayByUtc } from "@/utils/dateByUtc";
import { SignupData } from "@/protocols/auth.protocol";

async function createUser(data: SignupData) {
    const { name, email, password, utcOffset } = data;
    const sanitizedName = stripHtml(name.toString()).result.trim();
    const sanitizedEmail = stripHtml(email.toString()).result.trim();

    const foundUser = await authRepository.getUserByEmail(sanitizedEmail);
    if (foundUser) {
        throw { type: "conflict", message: "Email already registered" };
    }
    const hash = hashSync(password, 10);
    const lastWeekday = getWeekdayByUtc(utcOffset);

    await authRepository.createUser({
        name: sanitizedName,
        email: sanitizedEmail,
        password: hash,
        utcOffset,
        lastWeekday,
    });
}

async function generateToken(email: string, password: string) {
    const foundUser = await authRepository.getUserByEmail(email);
    if (!foundUser) {
        throw { type: "unauthorized", message: "Invalid email and/or password" };
    }
    if (compareSync(password, foundUser.password)) {
        const tokenExpirationInSeconds = 60 * 60 * 24 * 30; // 30 days
        const token = jwt.sign(
            {
                userId: foundUser._id,
                utcOffset: foundUser.utcOffset,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: tokenExpirationInSeconds,
            }
        );
        return { name: foundUser.name, token };
    }
    throw { type: "unauthorized", message: "Invalid email and/or password" };
}

export const authService = {
    createUser,
    generateToken,
};
