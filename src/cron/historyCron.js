import { db } from "../database/database.connection.js";
import { getWeekday, getDate, dayTurnedOffset, getPreviousDate } from "../getUserDate.js";

// Updates habit's streak
function updateHabits(user) {
    const habits = [...user.habits];

    for (const habit of user.history[0].habits) {
        const habitIndex = habits.findIndex((habitToFind) => habitToFind.id === habit.id);
        const habitFound = habits[habitIndex];
        habitFound.done = false;
    
        if (habit.done) {
            habitFound.currentSequence++;
            habitFound.highestSequence = Math.max(habitFound.currentSequence, habitFound.highestSequence);
            continue;
        }
        habitFound.currentSequence = 0;
    }
    return habits;
}

// Updates user's history
function updateHistory(user, newWeekday, utcTarget, bulkWriteOperations) {
    if (user.habits.length === 0) {
        return;
    }

    // Checks if last history entry matches previous day to update habit's streak
    const newHabits = user.history[0]?.date === getPreviousDate(utcTarget) ? updateHabits(user) : [];
    const dailyHabits = user.habits.filter((habit) => habit.days.includes(newWeekday));

    // Checks if there are any habits to do in current day
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

    // Creates new history entry for current day if there are habits to do
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

// Searches for users who have utcOffset matching the first hour of the day and updates their histories
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
        
        // Aggregates all queries for optimization
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
