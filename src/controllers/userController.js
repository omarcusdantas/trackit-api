import { stripHtml } from "string-strip-html";
import { db } from "../database/database.connection.js";
import { getDate, getWeekday } from "../getUserDate.js";

async function updateCurrentHistory(email, newHabit, currentHistory, today) {
    if (currentHistory?.date === today) {
        currentHistory.habits.push({
            name: newHabit.name,
            done: false,
            id: newHabit.id,
        });
        await db.collection("userActivities").updateOne(
            { email },
            {
                $push: { habits: newHabit },
                $set: { "history.0": currentHistory },
            }
        );
        return;
    }
    const newHistoryEntry = {
        date: today,
        habits: [
            {
                name: newHabit.name,
                done: false,
                id: newHabit.id,
            },
        ],
    };
    await db.collection("userActivities").updateOne(
        { email },
        {
            $push: {
                habits: newHabit,
                history: { $each: [newHistoryEntry], $position: 0 },
            },
        }
    );
}

export async function addHabit(req, res) {
    const { email, utcOffset } = res.locals.user;
    const { name, days } = req.body;
    const sanitizedName = stripHtml(name.toString()).result.trim();

    try {
        const userActivities = await db.collection("userActivities").findOne(
            { email },
            {
                projection: {
                    habits: 1,
                    history: 1,
                },
            }
        );
        const newId =
            userActivities.habits.length === 0 ? 0 : userActivities.habits[userActivities.habits.length - 1].id + 1;
        const newHabit = {
            name: sanitizedName,
            days,
            id: newId,
            currentSequence: 0,
            highestSequence: 0,
        };
        const weekday = getWeekday(utcOffset);

        if (days.includes(weekday)) {
            const currentHistory = userActivities.history[0];
            const today = getDate(utcOffset);
            await updateCurrentHistory(email, newHabit, currentHistory, today);
            return res.sendStatus(201);
        }

        await db.collection("userActivities").updateOne({ email }, { $push: { habits: newHabit } });
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getHabits(req, res) {
    const { email } = res.locals.user;

    try {
        const userActivities = await db.collection("userActivities").findOne({ email }, { projection: { habits: 1 } });
        return res.send(userActivities.habits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function deleteHabit(req, res) {
    const id = parseInt(req.params.id);
    const { email, utcOffset } = res.locals.user;

    if (isNaN(id)) {
        return res.status(400).send("Insert a valid id.");
    }

    try {
        const userActivities = await db.collection("userActivities").findOne(
            { email },
            {
                projection: {
                    habits: 1,
                    history: 1,
                },
            }
        );
        const habitIndex = userActivities.habits.findIndex((habit) => habit.id === id);

        if (habitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        const habit = userActivities.habits[habitIndex];
        const weekday = getWeekday(utcOffset);
        userActivities.habits.splice(habitIndex, 1);

        if (habit.days.includes(weekday)) {
            const currentHistory = userActivities.history[0];
            currentHistory.habits = currentHistory.habits.filter((habit) => habit.id !== id);

            if (currentHistory.habits.length === 0) {
                await db
                    .collection("userActivities")
                    .updateOne(
                        { email },
                        { $set: { habits: userActivities.habits }, $pop: { history: -1 } }
                    );
                return res.sendStatus(204);
            }

            await db
                .collection("userActivities")
                .updateOne({ email }, { $set: { habits: userActivities.habits, "history.0": currentHistory } });
            return res.sendStatus(204);
        }

        await db.collection("userActivities").updateOne({ email }, { $set: { habits: userActivities.habits } });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getDailyHabits(req, res) {
    const { email, utcOffset } = res.locals.user;

    try {
        const userActivities = await db.collection("userActivities").findOne({ email }, { projection: { habits: 1 } });
        const weekday = getWeekday(utcOffset);
        const dailyHabits = userActivities.habits.filter((habit) => habit.days.includes(weekday));
        return res.send(dailyHabits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getHistory(req, res) {
    const { email } = res.locals.user;

    try {
        const userActivities = await db.collection("userActivities").findOne({ email }, { projection: { history: 1 } });
        return res.send(userActivities.history);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function trackHabit(req, res) {
    const { email, utcOffset } = res.locals.user;
    const type = req.params.type;
    const id = parseInt(req.params.id);

    if (isNaN(id) || (type !== "check" && type !== "uncheck")) {
        return res.sendStatus(400);
    }

    const doneStatus = type === "check";

    try {
        const userActivities = await db
            .collection("userActivities")
            .findOne({ email }, { projection: { history: 1 } });
        const currentHistory = userActivities.history[0];

        if (currentHistory?.date !== getDate(utcOffset)) {
            return res.status(404).send("No habits for today.");
        }

        const habitIndex = currentHistory.habits.findIndex((habit) => habit.id === id);

        if (habitIndex === -1) {
            return res.status(404).send("Habit not found for today.");
        }

        if (currentHistory.habits[habitIndex].done === doneStatus) {
            return res.status(409).send("Habit already in the desired state.");
        }

        await db
            .collection("userActivities")
            .updateOne({ email }, { $set: { [`history.0.habits.${habitIndex}.done`]: doneStatus } });
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
