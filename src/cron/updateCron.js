import { db } from "../app.js";
import { getWeekday, getDate, dayTurnedOffset, getPreviousDate } from "../getUserDate.js";

// Updates habit's streak
function updateHabits(user) {
    const habits = [...user.habits];

    for (const habit of user.currentActivities.habits) {
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

// Updates user's current activities
function updateCurrentActivities(user, dailyHabits, utcTarget, newHabits, bulkWriteHabits) {
    const newCurrent = {
        date: getDate(utcTarget),
        habits: dailyHabits.map((habit) => ({
            name: habit.name,
            done: false,
            id: habit.id,
            highestSequence: habit.highestSequence,
            currentSequence: habit.currentSequence,
        })),
    };

    // Checks if there are habits to update
    if (newHabits.length === 0) {
        bulkWriteHabits.push({
            updateOne: {
                filter: { email: user.email },
                update: { $set: { currentActivities: newCurrent } },
            },
        });
        return;
    }
    bulkWriteHabits.push({
        updateOne: {
            filter: { email: user.email },
            update: { $set: { currentActivities: newCurrent, habits: newHabits } },
        },
    });
}

// Removes properties "highestSequence" and "currentSequence" from each habit to set history
function removeSequenceProperties(habit) {
    const { highestSequence, currentSequence, ...rest } = habit;
    return rest;
}

// Updates user's history
function updateHistory(user) {
    const newHistoryEntry = {
        date: user.currentActivities.date,
        habits: user.currentActivities.habits.map(removeSequenceProperties),
    };
    bulkWriteHistory.push({
        updateOne: {
            filter: { email: user.email },
            update: { $push: { history: newHistoryEntry } },
        },
    });
}

// Updates user's current activities
function updateUser(user, newWeekday, utcTarget, bulkWriteHabits, bulkWriteHistory) {
    if (user.habits.length === 0) {
        return;
    }

    let newHabits = [];
    // Checks if current activities matches previous day to update habit's streak
    if (user.currentActivities?.date === getPreviousDate(utcTarget)) {
        newHabits = updateHabits(user);
        updateHistory(user);
    }

    const dailyHabits = user.habits.filter((habit) => habit.days.includes(newWeekday));
    // Checks if there are any habits to do in new day
    if (dailyHabits.length === 0) {
        if (newHabits.length === 0) {
            return;
        }
        bulkWriteHabits.push({
            updateOne: {
                filter: { email: user.email },
                update: { $set: { habits: newHabits, currentActivities: {} } },
            },
        });
        return;
    }
    updateCurrentActivities(user, dailyHabits, utcTarget, newHabits, bulkWriteHabits);
}

// Searches for users who have utcOffset matching the first hour of the day and updates their data
export default async function updateCron() {
    try {
        const utcTarget = dayTurnedOffset();
        const users = await db.collection("users").find({ utcOffset: utcTarget }).toArray();
        const newWeekday = getWeekday(utcTarget);

        if (users.length === 0) {
            console.log("No user to update!");
            return;
        }

        const usersToUpdate = users.map((user) => user.email);
        const usersHabits = await db
            .collection("usersHabits")
            .find({ email: { $in: usersToUpdate } })
            .toArray();

        // Aggregates all queries for optimization
        const bulkWriteHabits = [];
        const bulkWriteHistory = [];
        for (const user of usersHabits) {
            updateUser(user, newWeekday, utcTarget, bulkWriteHabits, bulkWriteHistory);
        }

        if (bulkWriteHabits.length > 0) {
            await db.collection("usersHabits").bulkWrite(bulkWriteHabits);
        }
        if (bulkWriteHistory.length > 0) {
            await db.collection("usersHistory").bulkWrite(bulkWriteHistory);
        }

        await db
            .collection("users")
            .updateMany({ email: { $in: usersToUpdate } }, { $set: { lastWeekday: newWeekday } });
        console.log("History updated!");
    } catch (error) {
        console.log(error);
    }
}