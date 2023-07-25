import { db } from "../database/database.connection.js";
import { getWeekday, getDate, dayTurnedOffset, getPreviousDate } from "../getUserDate.js";

function updateHabits(user) {
    const habits = [...user.habits];

    for (const habit of user.history[0].habits) {
        const habitIndex = habits.findIndex((habitToFind) => habitToFind.id === habit.id);
        const habitFound = habits[habitIndex];
    
        if (habit.done) {
            habitFound.currentSequence++;
            habitFound.highestSequence = Math.max(habitFound.currentSequence, habitFound.highestSequence);
            continue;
        }
        habitFound.currentSequence = 0;
    }
    return habits;
}

function updateHistory(user, newWeekday, utcTarget, bulkWriteOperations) {
    if (user.habits.length === 0) {
        return;
    }

    const newHabits = user.history[0]?.date === getPreviousDate(utcTarget) ? updateHabits(user) : [];
    const dailyHabits = user.habits.filter((habit) => habit.days.includes(newWeekday));

    if (dailyHabits.length === 0) {
        if (newHabits.length === 0) {
            return;
        }
        bulkWriteOperations.push({
            updateOne: {
                filter: { email: user.email },
                update: { $set: { habits: newHabits } },
            },
        });
        return;
    }

    const newHistoryEntry = {
        date: getDate(utcTarget),
        habits: dailyHabits.map((habit) => ({
            name: habit.name,
            done: false,
            id: habit.id,
        })),
    };

    if (newHabits.length === 0) {
        bulkWriteOperations.push({
            updateOne: {
                filter: { email: user.email },
                update: {
                    $push: { history: { $each: [newHistoryEntry], $position: 0 } },
                },
            },
        });
        return;
    }
    bulkWriteOperations.push({
        updateOne: {
            filter: { email: user.email },
            update: {
                $set: { habits: newHabits },
                $push: { history: { $each: [newHistoryEntry], $position: 0 } },
            },
        },
    });
}

export default async function historyCron() {
    try {
        const utcTarget = dayTurnedOffset();
        const users = await db.collection("users").find({ utcOffset: utcTarget }).toArray();
        const newWeekday = getWeekday(utcTarget);

        if (users.length === 0) {
            console.log("No user to update!");
            return;
        }

        const usersToUpdate = users.map((user) => user.email);
        const usersActivities = await db
            .collection("userActivities")
            .find({ email: { $in: usersToUpdate } })
            .toArray();

        const bulkWriteOperations = [];

        for (const user of usersActivities) {
            updateHistory(user, newWeekday, utcTarget, bulkWriteOperations);
        }

        if (bulkWriteOperations.length > 0) {
            await db.collection("userActivities").bulkWrite(bulkWriteOperations);
        }

        await db.collection("users").updateMany({ email: { $in: usersToUpdate } }, { $set: { lastWeekday: newWeekday } });
        console.log("History updated!");
    } catch (error) {
        console.log(error);
    }
}
