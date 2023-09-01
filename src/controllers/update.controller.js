import { getWeekday, getDate, dayTurnedOffset, getPreviousDate } from "../getUserDate.js";
import {
    updateQuery,
    getUsersByUtcOffset,
    getUsersHabits,
    executeBulkWrite,
    updateUsersWeekday,
} from "../repositories/update.repository.js";

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
        bulkWriteHabits.push(updateQuery(user.userId, { currentActivities: newCurrent }));
        return;
    }
    bulkWriteHabits.push(updateQuery(user.userId, { currentActivities: newCurrent, habits: newHabits }));
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

    bulkWriteHistory.push(updateQuery(user.userId, { history: newHistoryEntry }));
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
        bulkWriteHabits.push(updateQuery(user.userId, { habits: newHabits }));
        return;
    }
    updateCurrentActivities(user, dailyHabits, utcTarget, newHabits, bulkWriteHabits);
}

// Searches for users who have utcOffset matching the first hour of the day and updates their data
export async function updateUsers(req, res) {
    try {
        const utcTarget = dayTurnedOffset();
        const users = await getUsersByUtcOffset(utcTarget);
        const newWeekday = getWeekday(utcTarget);

        if (users.length === 0) {
            console.log("No user to update!");
            return res.sendStatus(200);
        }

        const usersToUpdate = users.map((user) => user._id);
        const usersHabits = await getUsersHabits(usersToUpdate);

        // Aggregates all queries for optimization
        const bulkWriteHabits = [];
        const bulkWriteHistory = [];
        for (const user of usersHabits) {
            updateUser(user, newWeekday, utcTarget, bulkWriteHabits, bulkWriteHistory);
        }

        if (bulkWriteHabits.length > 0) {
            await executeBulkWrite("usersHabits", bulkWriteHabits);
        }
        if (bulkWriteHistory.length > 0) {
            await executeBulkWrite("usersHistory", bulkWriteHistory);
        }

        await updateUsersWeekday(usersToUpdate, newWeekday);
        console.log("History updated!");
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
