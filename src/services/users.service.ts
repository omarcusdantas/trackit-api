import * as dateByUtc from "@/utils/dateByUtc";
import { usersRepository, QueryToUpdateUser } from "@/repositories/users.repository";
import { UserData } from "@/protocols/users.protocol";
import { Habit } from "@/protocols/habits.protocol";

type UserDataToUpdate = {
    userActivities: UserData;
    newWeekday: number;
    utcWhereDayChanged: number;
    bulkWriteHabits: QueryToUpdateUser[];
    bulkWriteHistory: QueryToUpdateUser[];
};

type CurrentActivitiesToUpdateData = {
    userActivities: UserData;
    newDayActivities: Habit[];
    utcWhereDayChanged: number;
    newHabits: Habit[];
    bulkWriteHabits: QueryToUpdateUser[];
};

function generateQueryToUpdateHabits(
    userId: number,
    dailyActivities: UserData["currentActivities"],
    newHabits: Habit[]
) {
    if (newHabits.length === 0) {
        return usersRepository.newQueryToUpdateUserData(userId, { currentActivities: dailyActivities });
    }
    return usersRepository.newQueryToUpdateUserData(userId, {
        currentActivities: dailyActivities,
        habits: newHabits,
    });
}

function updateHabits(userActivities: UserData) {
    const { habits } = userActivities;

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

function updateCurrentActivities(data: CurrentActivitiesToUpdateData) {
    const { userActivities, newDayActivities, utcWhereDayChanged, newHabits, bulkWriteHabits } = data;
    const dailyActivities = {
        date: dateByUtc.getDateByUtc(utcWhereDayChanged),
        habits: newDayActivities.map((habit) => {
            delete habit.days;
            return { ...habit, done: false };
        }),
    };
    bulkWriteHabits.push(generateQueryToUpdateHabits(userActivities.userId, dailyActivities, newHabits));
}

function generateNewHistoryEntry(userActivities: UserData) {
    const { userId, currentActivities } = userActivities;
    const newHistoryEntry = {
        date: currentActivities.date,
        habits: currentActivities.habits.map((habit) => ({
            name: habit.name,
            done: habit.done,
            id: habit.id,
        })),
    };
    return usersRepository.newQueryToUpdateUserData(userId, { historyEntry: newHistoryEntry });
}

function updateUserData(data: UserDataToUpdate) {
    const { userActivities, newWeekday, utcWhereDayChanged, bulkWriteHabits, bulkWriteHistory } = data;
    const { habits, currentActivities } = userActivities;
    if (habits.length === 0) return;

    let newHabits = [];
    if (currentActivities.date === dateByUtc.getPreviousDate(utcWhereDayChanged)) {
        newHabits = updateHabits(userActivities);
        bulkWriteHistory.push(generateNewHistoryEntry(userActivities));
    }

    const newDayActivities = habits.filter((habit) => habit.days.includes(newWeekday));
    if (newDayActivities.length === 0) {
        if (newHabits.length === 0) return;
        bulkWriteHabits.push(usersRepository.newQueryToUpdateUserData(userActivities.userId, { habits: newHabits }));
        return;
    }
    updateCurrentActivities({ userActivities, newDayActivities, utcWhereDayChanged, newHabits, bulkWriteHabits });
}

async function sendQueries(bulkWriteHabits: QueryToUpdateUser[], bulkWriteHistory: QueryToUpdateUser[]) {
    if (bulkWriteHabits.length > 0) {
        await usersRepository.executeBulkWrite("usersHabits", bulkWriteHabits);
    }
    if (bulkWriteHistory.length > 0) {
        await usersRepository.executeBulkWrite("usersHistory", bulkWriteHistory);
    }
}

async function updateData() {
    const utcWhereDayChanged = dateByUtc.utcWhereIsMidnight();
    const usersToUpdate = await usersRepository.getUsersByUtcOffset(utcWhereDayChanged);
    if (usersToUpdate.length === 0) {
        return;
    }

    const newWeekday = dateByUtc.getWeekdayByUtc(utcWhereDayChanged);
    const usersIdsToUpdate = usersToUpdate.map((user) => user._id);
    const usersActivities = await usersRepository.getUsersHabitsAndCurrentActivities(usersIdsToUpdate);

    const bulkWriteHabits = [];
    const bulkWriteHistory = [];
    for (const userActivities of usersActivities) {
        updateUserData({ userActivities, newWeekday, utcWhereDayChanged, bulkWriteHabits, bulkWriteHistory });
    }

    await sendQueries(bulkWriteHabits, bulkWriteHistory);
    return usersRepository.updateUsersWeekday(usersIdsToUpdate, newWeekday);
}

export const usersService = {
    updateData,
};
