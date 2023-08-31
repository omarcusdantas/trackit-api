import { db } from "../app.js";
import { getWeekday, getDate, dayTurnedOffset, getPreviousDate } from "../getUserDate.js";
import { ObjectId } from "mongodb";

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
                filter: { userId: new ObjectId(user.userId) },
                update: { $set: { currentActivities: newCurrent } },
            },
        });
        return;
    }
    bulkWriteHabits.push({
        updateOne: {
            filter: { userId: new ObjectId(user.userId) },
            update: { $set: { currentActivities: newCurrent, habits: newHabits } },
        },
    });
}

// Updates user's history
function updateHistory(user, bulkWriteHistory) {
    const newHistoryEntry = {
        date: user.currentActivities.date,
        habits: user.currentActivities.habits.map((habit) => {
            const habitCopy = { ...habit };
            delete habitCopy.highestSequence;
            delete habitCopy.currentSequence;
            return habitCopy;
        }),
    };

    bulkWriteHistory.push({
        updateOne: {
            filter: { userId: new ObjectId(user.userId) },
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
        updateHistory(user, bulkWriteHistory);
    }

    const dailyHabits = user.habits.filter((habit) => habit.days.includes(newWeekday));
    // Checks if there are any habits to do in new day
    if (dailyHabits.length === 0) {
        if (newHabits.length === 0) {
            return;
        }
        bulkWriteHabits.push({
            updateOne: {
                filter: { userId: new ObjectId(user.userId) },
                update: { $set: { habits: newHabits, currentActivities: {} } },
            },
        });
        return;
    }
    updateCurrentActivities(user, dailyHabits, utcTarget, newHabits, bulkWriteHabits);
}

// Searches for users who have utcOffset matching the first hour of the day and updates their data
export async function updateUsers(req, res) {
    try {
        const utcTarget = dayTurnedOffset();
        const users = await db.collection("users").find({ utcOffset: utcTarget }).toArray();
        const newWeekday = getWeekday(utcTarget);

        if (users.length === 0) {
            console.log("No user to update!");
            return res.sendStatus(200);
        }

        const usersToUpdate = users.map((user) => user._id);
        const usersHabits = await db
            .collection("usersHabits")
            .find({ userId: { $in: usersToUpdate } })
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

        console.log(usersToUpdate);
        console.log(usersHabits);

        await db.collection("users").updateMany({ _id: { $in: usersToUpdate } }, { $set: { lastWeekday: newWeekday } });
        console.log("History updated!");
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
