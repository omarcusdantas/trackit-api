import { db } from "../database/database.connection.js";

export async function addHabit(req, res) {
    const email = res.locals.email;
    const { name, days } = req.body;

    try {
        const userData = await db.collection("usersData").findOne({ email });

        let newId;
        if(userData.habits.length === 0) {
            newId = 0;
        } else {
            newId = userData.habits[userData.habits.length-1].id + 1;
        }

        const newHabit = { name, days, id: newId };

        await db
            .collection("usersData")
            .updateOne(
                { email },
                { $set: { habits: [...userData.habits, newHabit] }}
            );

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getHabits(req, res) {
    const email = res.locals.email;

    try {
        const userData = await db.collection("usersData").findOne({ email });
        return res.send(userData.habits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function deleteHabit(req, res) {
    const id = parseInt(req.params.id);
    const email = res.locals.email;

    if (isNaN(id)) {
        return res.sendStatus(400);
    }

    try {
        const userData = await db.collection("usersData").findOne({ email });
        const habitIndex = userData.habits.findIndex((habit) => habit.id === id);

        if (habitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        const updatedHabits = [
            ...userData.habits.slice(0, habitIndex),
            ...userData.habits.slice(habitIndex + 1),
        ];

        await db.collection("usersData").updateOne(
            { email },
            { $set: { habits: updatedHabits }}
        );

        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
