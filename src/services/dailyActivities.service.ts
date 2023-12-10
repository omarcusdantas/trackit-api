import { dailyActivitiesRepository } from "@/repositories/dailyActivities.repository";
import { getDateByUtc } from "@/utils/dateByUtc";
import { CurrentActivities } from "@/protocols/habits.protocol";

type UpdateData = {
    userId: number;
    habitId: number;
    type: string;
    utcOffset: number;
};

type UpdateHabitData = {
    currentActivities: CurrentActivities;
    userId: number;
    habitIndex: number;
    doneStatus: boolean;
}

async function getByUserId(userId: number, utcOffset: number) {
    const currentActivities = await dailyActivitiesRepository.readByUserId(userId);
    const currentDate = getDateByUtc(utcOffset);

    const dailyActivities = 
        currentActivities?.date === currentDate ? currentActivities.habits : [];
    return dailyActivities;
}

function updateHabit(data: UpdateHabitData) {
    const { currentActivities, userId, habitIndex, doneStatus } = data;
    const habit = currentActivities.habits[habitIndex];

    if (habit.done === doneStatus) {
        throw { type: "conflict", message: "Habit already in the desired state" };
    }

    habit.done = doneStatus;
    doneStatus === true ? habit.currentSequence++ : habit.currentSequence--;
    habit.highestSequence = Math.max(habit.currentSequence, habit.highestSequence);

    return dailyActivitiesRepository.updateByUserId(userId, currentActivities);
}

async function updateByUserIdAndHabitId(data: UpdateData) {
    const { userId, habitId, type, utcOffset } = data;
    if (isNaN(habitId) || (type !== "check" && type !== "uncheck")) {
        throw { type: "badRequest", message: "Invalid type or habitId format" };
    }

    const doneStatus = type === "check";
    const currentActivities = await dailyActivitiesRepository.readByUserId(userId);
    const currentDate = getDateByUtc(utcOffset);

    if (currentActivities?.date !== currentDate) {
        throw { type: "notFound", message: "No habits for today" };
    }

    const habitIndex = currentActivities.habits.findIndex((habit) => habit.id === habitId);
    if (habitIndex === -1) {
        throw { type: "notFound", message: "Habit not found" };
    }
    return updateHabit({ currentActivities, userId, habitIndex, doneStatus });
}

export const dailyActivitiesService = {
    getByUserId,
    updateByUserIdAndHabitId,
};
