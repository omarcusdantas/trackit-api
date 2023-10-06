import * as dateByUtc from "../utils/dateByUtc.js";
import updateRepository from "../repositories/update.repository.js";

function updateHabits(userActivities) {
    const habits = [...userActivities.habits];

    for (const habit of userActivities.currentActivities.habits) {
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

function updateCurrentActivities(userActivities, newDayActivities, utcWhereDayChanged, newHabits, bulkWriteHabits) {
    const dailyActivities = {
        date: dateByUtc.getDateByUtc(utcWhereDayChanged),
        habits: newDayActivities.map((habit) => ({
            name: habit.name,
            done: false,
            id: habit.id,
            highestSequence: habit.highestSequence,
            currentSequence: habit.currentSequence,
        })),
    };

    if (newHabits.length === 0) {
        bulkWriteHabits.push(updateRepository.newQuery(userActivities.userId, { currentActivities: dailyActivities }));
        return;
    }
    bulkWriteHabits.push(
        updateRepository.newQuery(userActivities.userId, { currentActivities: dailyActivities, habits: newHabits })
    );
}

function updateHistory(userActivities, bulkWriteHistory) {
    const newHistoryEntry = {
        date: userActivities.currentActivities.date,
        habits: userActivities.currentActivities.habits.map((habit) => {
            const habitCopy = { ...habit };
            delete habitCopy.highestSequence;
            delete habitCopy.currentSequence;
            return habitCopy;
        }),
    };
    bulkWriteHistory.push(updateRepository.newQuery(userActivities.userId, { history: newHistoryEntry }));
}

function updateUserData(userActivities, newWeekday, utcWhereDayChanged, bulkWriteHabits, bulkWriteHistory) {
    const { habits, currentActivities } = userActivities;
    if (habits.length === 0) {
        return;
    }

    let newHabits = [];
    if (currentActivities.date === dateByUtc.getPreviousDate(utcWhereDayChanged)) {
        newHabits = updateHabits(userActivities);
        updateHistory(userActivities, bulkWriteHistory);
    }

    const newDayActivities = habits.filter((habit) => habit.days.includes(newWeekday));
    if (newDayActivities.length === 0) {
        if (newHabits.length === 0) {
            return;
        }
        bulkWriteHabits.push(updateRepository.newQuery(userActivities.userId, { habits: newHabits }));
        return;
    }
    updateCurrentActivities(userActivities, newDayActivities, utcWhereDayChanged, newHabits, bulkWriteHabits);
}

async function updateUsersData() {
    const utcWhereDayChanged = dateByUtc.utcWhereIsMidnight();

    const usersToUpdate = await updateRepository.getUsersByUtcOffset(utcWhereDayChanged);
    if (usersToUpdate.length === 0) {
        console.log("No user to update!");
        return;
    }

    const newWeekday = dateByUtc.getWeekdayByUtc(utcWhereDayChanged);
    const usersIdsToUpdate = usersToUpdate.map((user) => user._id);
    const usersActivities = await updateRepository.getUsersHabitsAndCurrentActivities(usersIdsToUpdate);

    const bulkWriteHabits = [];
    const bulkWriteHistory = [];

    for (const userActivities of usersActivities) {
        updateUserData(userActivities, newWeekday, utcWhereDayChanged, bulkWriteHabits, bulkWriteHistory);
    }

    if (bulkWriteHabits.length > 0) {
        await updateRepository.executeBulkWrite("usersHabits", bulkWriteHabits);
    }
    if (bulkWriteHistory.length > 0) {
        await updateRepository.executeBulkWrite("usersHistory", bulkWriteHistory);
    }

    await updateRepository.updateUsersWeekday(usersIdsToUpdate, newWeekday);
    console.log("History updated!");
}

const updateService = {
    updateUsersData,
};
export default updateService;
