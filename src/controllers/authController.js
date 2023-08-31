import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { stripHtml } from "string-strip-html";
import { db } from "../app.js";
import { getWeekday } from "../getUserDate.js";

// Creates new user on database
export async function signup(req, res) {
    const { name, email, password, utcOffset } = req.body;
    const sanitizedName = stripHtml(name.toString()).result.trim();
    const sanitizedEmail = stripHtml(email.toString()).result.trim();

    try {
        const foundUser = await db.collection("users").findOne({ email: sanitizedEmail });
        if (foundUser) {
            return res.status(409).send("Email already registered");
        }

        const hash = hashSync(password, 10);
        const lastWeekday = getWeekday(utcOffset);

        const newUser = await db.collection("users").insertOne({
            name: sanitizedName,
            email: sanitizedEmail,
            password: hash,
            utcOffset,
            lastWeekday,
        });

        const userId = newUser.insertedId;
        await db.collection("usersHabits").insertOne({
            userId: userId,
            habits: [],
            currentActivities: {},
        });
        await db.collection("usersHistory").insertOne({
            userId: userId,
            history: [],
        });

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Generates jwt if user's sigin info matches with database
export async function signin(req, res) {
    const tokenExpirationSeconds = 60 * 60 * 24 * 30;
    const { email, password } = req.body;

    try {
        const foundUser = await db.collection("users").findOne({ email });
        if (!foundUser) {
            return res.status(404).send("Email not registered");
        }

        if (compareSync(password, foundUser.password)) {
            const token = jwt.sign({ userId: foundUser._id, utcOffset: foundUser.utcOffset }, process.env.JWT_SECRET, {
                expiresIn: tokenExpirationSeconds,
            });
            return res.status(200).send({ name: foundUser.name, token });
        }
        return res.status(401).send("Wrong password");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
