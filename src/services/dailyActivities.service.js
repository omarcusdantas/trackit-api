import dailyActivitiesRepository from "../repositories/dailyActivities.repository.js";
import { getDateByUtc } from "../utils/dateByUtc.js";

async function getByUserId(userId, utcOffset) {
    const currentActivities = await dailyActivitiesRepository.readByUserId(userId);
    const currentDate = getDateByUtc(utcOffset);
    const dailyActivities = currentActivities?.date === currentDate ? currentActivities.habits : [];
    return dailyActivities;
}

async function updateByUserIdAndHabitId(userId, utcOffset, habitId, type) {
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

    const habit = currentActivities.habits[habitIndex];
    if (habit.done === doneStatus) {
        throw { type: "conflict", message: "Habit already in the desired state" };
    }

    habit.done = doneStatus;
    doneStatus === true ? habit.currentSequence++ : habit.currentSequence--;
    habit.highestSequence = Math.max(habit.currentSequence, habit.highestSequence);

    await dailyActivitiesRepository.updateByUserId(userId, currentActivities);
}

const dailyActivitiesService = {
    getByUserId,
    updateByUserIdAndHabitId,
};
export default dailyActivitiesService;
