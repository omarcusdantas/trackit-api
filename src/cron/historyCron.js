import { db } from "../database/database.connection.js";
import { getWeekday, getDate } from "../getUserDate.js";

async function updateHabits(user) {
    const habits = [...user.habits];

    user.history[0].habits.forEach((habit) => {
        const habitIndex = habits.findIndex((h) => h.id === habit.id);

        if (habit.done === true) {
            habits[habitIndex].currentSequence++;
            if (habits[habitIndex].currentSequence > habits[habitIndex].highestSequence) {
                habits[habitIndex].highestSequence = habits[habitIndex].currentSequence;
            }
            return;
        }
        habits[habitIndex].currentSequence = 0;
    })
    return habits;
}

async function updateHistory(user) {
    const weekday = getWeekday(user.timezone);
    if (weekday === user.lastDate) {
        return;
    }

    const newHabits = updateHabits(user);

    const dailyHabits = user.habits.filter((habit) => habit.days.includes(weekday));
    if (dailyHabits.length === 0) {
        await db.collection("usersData").updateOne(
            { email: user.email },
            {
                $set: { lastDate: weekday, habits: newHabits },
            }
        );
        return;
    }

    const newHistoryEntry = {
        date: getDate(user.timezone),
        habits: dailyHabits.map((habit) => ({
            name: habit.name,
            done: false,
            id: habit.id,
        })),
    };

    await db.collection("usersData").updateOne(
        { email: user.email },
        {
            $set: { lastDate: weekday, habits: newHabits },
            $push: { history: { $each: [newHistoryEntry], $position: 0 }},
        }
    );
}

export default async function historyCron() {
    try {
        const usersToUpdate = await db
            .collection("usersData")
            .find({
                lastDate: { $ne: getWeekday() }
            })
            .toArray();

        const updatePromises = usersToUpdate.map((user) => updateHistory(user));
        await Promise.all(updatePromises);

        console.log("History updated!");
    } catch (error) {
        console.log(error);
    }
}
