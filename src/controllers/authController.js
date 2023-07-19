import bcrypt from "bcrypt";
import { db } from "../database/database.connection.js";
import jwt from "jsonwebtoken";
import { getWeekday } from "../getUserDate.js";

export async function signup(req, res) {
    const { name, email, password, timezone } = req.body

    try {
        const foundUser = await db.collection("users").findOne({ email });

        if (foundUser) {
            return res.status(409).send("Email already registered.");
        }

        const hash = bcrypt.hashSync(password, 10);
        const lastDate = getWeekday(timezone);

        await db.collection("users").insertOne({ name, email, password: hash });
        await db.collection("usersData").insertOne({ email, habits: [], history: [], timezone, lastDate });

        return res.sendStatus(201);
    } catch(error) {
        return res.status(500).send(error.message);
    }
}

export async function signin(req, res) {
    const { email, password } = req.body;

    try {
        const foundUser = await db.collection("users").findOne({ email });

        if (!foundUser) {
            return res.status(404).send("Email not registered.");
        }

        if (bcrypt.compareSync(password, foundUser.password)) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: 60*60*24*30 });
            return res.status(200).send(token);
        }
        return res.status(401).send("Wrong password");
    } catch(error) {
        return res.status(500).send(error.message);
    }
}