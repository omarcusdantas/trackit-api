import { stripHtml } from "string-strip-html";
import { db } from "../app.js";
import { getDate, getWeekday } from "../getUserDate.js";

// Updates current activities if new habit affects its habits
async function updatecurrentActivities(email, newHabit, currentActivities, currentDay) {
    // Inserts into current activities' habits
    if (currentActivities?.date === currentDay) {
        currentActivities.habits.push({
            name: newHabit.name,
            done: false,
            id: newHabit.id,
            highestSequence: 0,
            currentSequence: 0,
        });
        await db.collection("usersHabits").updateOne(
            { email },
            {
                $push: { habits: newHabit },
                $set: { currentActivities: currentActivities },
            }
        );
        return;
    }

    // Sets current activities
    const newCurrent = {
        date: currentDay,
        habits: [
            {
                name: newHabit.name,
                done: false,
                id: newHabit.id,
                highestSequence: 0,
                currentSequence: 0,
            },
        ],
    };
    await db.collection("usersHabits").updateOne(
        { email },
        {
            $push: { habits: newHabit },
            $set: { currentActivities: newCurrent },
        }
    );
}

// Adds new habit
export async function addHabit(req, res) {
    const { email, utcOffset } = res.locals.user;
    const { name, days } = req.body;
    const sanitizedName = stripHtml(name.toString()).result.trim();

    try {
        const userHabits = await db.collection("usersHabits").findOne({ email });
        const { habits, currentActivities } = userHabits
        const newId =
            habits.length === 0 ? 0 : habits[habits.length - 1].id + 1;
        const newHabit = {
            name: sanitizedName,
            days,
            id: newId,
            currentSequence: 0,
            highestSequence: 0,
        };

        const weekday = getWeekday(utcOffset);
        // Checks if new habit affects current activities
        if (days.includes(weekday)) {
            const currentDay = getDate(utcOffset);
            await updatecurrentActivities(email, newHabit, currentActivities, currentDay);
            return res.sendStatus(201);
        }

        await db.collection("usersHabits").updateOne({ email }, { $push: { habits: newHabit } });
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Gets list of user's habits
export async function getHabits(req, res) {
    const { email } = res.locals.user;

    try {
        const userHabits = await db.collection("usersHabits").findOne({ email }, { projection: { habits: 1 } });
        return res.send(userHabits.habits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Deletes a habit by id
export async function deleteHabit(req, res) {
    const id = parseInt(req.params.id);
    const { email, utcOffset } = res.locals.user;

    if (isNaN(id)) {
        return res.status(400).send("Insert a valid id");
    }

    try {
        const userHabits = await db.collection("usersHabits").findOne({ email });
        const { habits, currentActivities } = userHabits;

        const habitIndex = habits.findIndex((habit) => habit.id === id);
        if (habitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        const habit = habits[habitIndex];
        const weekday = getWeekday(utcOffset);
        habits.splice(habitIndex, 1);

        // Updates currentActivities if excluded habit affects its habits
        if (habit.days.includes(weekday)) {
            currentActivities.habits = currentActivities.habits.filter((habit) => habit.id !== id);
            // Empties currentActivities if the excluded habit was the only one
            if (currentActivities.habits.length === 0) {
                await db
                    .collection("usersHabits")
                    .updateOne({ email }, { $set: { habits: habits, currentActivities: {} }});
                return res.sendStatus(204);
            }
            await db
                .collection("usersHabits")
                .updateOne({ email }, { $set: { habits: habits, currentActivities: currentActivities } });
            return res.sendStatus(204);
        }

        await db.collection("usersHabits").updateOne({ email }, { $set: { habits: habits } });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Gets user's habits for current day
export async function getDailyHabits(req, res) {
    const { email, utcOffset } = res.locals.user;

    try {
        const userHabits = await db.collection("usersHabits").findOne({ email }, { projection: { currentActivities: 1 } });
        const { currentActivities } = userHabits;
        const currentDate = getDate(utcOffset);
        const dailyHabits = currentActivities?.date === currentDate? currentActivities.habits : [];
        return res.send(dailyHabits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Gets user's history
export async function getHistory(req, res) {
    const { email } = res.locals.user;

    try {
        const userHistory = await db.collection("usersHistory").findOne({ email });
        const recentHistory = userHistory.history.reverse();
        return res.send(recentHistory);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Marks the daily habit as done or undone
export async function trackHabit(req, res) {
    const { email, utcOffset } = res.locals.user;
    const type = req.params.type;
    const id = parseInt(req.params.id);

    if (isNaN(id) || (type !== "check" && type !== "uncheck")) {
        return res.sendStatus(400);
    }

    const doneStatus = type === "check";
    try {
        const userHabits = await db.collection("usersHabits").findOne({ email });
        const { currentActivities } = userHabits;
        if (currentActivities?.date !== getDate(utcOffset)) {
            return res.status(404).send("No habits for today");
        }

        const dailyHabitIndex = currentActivities.habits.findIndex((habit) => habit.id === id);
        if (dailyHabitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        if (currentActivities.habits[dailyHabitIndex].done === doneStatus) {
            return res.status(409).send("Habit already in the desired state");
        }
        currentActivities.habits[dailyHabitIndex].done = doneStatus;

        await db
            .collection("usersHabits")
            .updateOne(
                { email },
                { $set: { currentActivities: currentActivities } }
            );
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
