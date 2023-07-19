import { db } from "../database/database.connection.js";

export async function addHabit(req, res) {
    const email = res.locals.email;
    const { name, days } = req.body;

    try {
        const userData = await db.collection("habits").findOne({ email });

        let newId;
        if(userData.habits.length === 0) {
            newId = 0;
        } else {
            newId = userData.habits[userData.habits.length-1].id + 1;
        }

        const newHabit = {
            name,
            days,
            newId
        }

        await db
            .collection("habits")
            .updateOne(
                { email },
                { $set: { habits: [...userData.habits, newHabit] }}
            );

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}