import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { stripHtml } from "string-strip-html";
import authRepository from "../repositories/auth.repository.js";
import { getWeekdayByUtc } from "../utils/dateByUtc.js";

async function create(name, email, password, utcOffset) {
    const sanitizedName = stripHtml(name.toString()).result.trim();
    const sanitizedEmail = stripHtml(email.toString()).result.trim();

    const foundUser = await authRepository.getByEmail(sanitizedEmail);
    if (foundUser) {
        throw { type: "conflict", message: "Email already registered" };
    }

    const hash = hashSync(password, 10);
    const lastWeekday = getWeekdayByUtc(utcOffset);

    await authRepository.create({
        name: sanitizedName,
        email: sanitizedEmail,
        password: hash,
        utcOffset,
        lastWeekday,
    });
}

async function generateToken(email, password) {
    const foundUser = await authRepository.getByEmail(email);
    if (!foundUser) {
        throw { type: "notFound", message: "Email not registered" };
    }

    if (compareSync(password, foundUser.password)) {
        const tokenExpirationInSeconds = 60 * 60 * 24 * 30; // 30 days
        const token = jwt.sign({ userId: foundUser._id, utcOffset: foundUser.utcOffset }, process.env.JWT_SECRET, {
            expiresIn: tokenExpirationInSeconds,
        });
        return { name: foundUser.name, token };
    }
    throw { type: "unauthorized", message: "Wrong password" };
}

const authService = {
    create,
    generateToken,
};
export default authService;
