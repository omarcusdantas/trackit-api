import { stripHtml } from "string-strip-html";
import habitsRepository from "../repositories/habits.repository.js";
import { getWeekdayByUtc, getDateByUtc } from "../utils/dateByUtc.js";

async function updatecurrentActivities(userId, newHabit, currentActivities, currentDay) {
    if (currentActivities?.date === currentDay) {
        currentActivities.habits.push({
            name: newHabit.name,
            done: false,
            id: newHabit.id,
            highestSequence: 0,
            currentSequence: 0,
        });
        await habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit, currentActivities });
        return;
    }

    const newCurrent = {
        date: currentDay,
        habits: [
            {
                name: newHabit.name,
                done: false,
                id: newHabit.id,
                highestSequence: 0,
                currentSequence: 0,
            },
        ],
    };
    await habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit, currentActivities: newCurrent });
}

async function create(userId, utcOffset, habitName, habitDays) {
    const sanitizedName = stripHtml(habitName.toString()).result.trim();

    const userHabits = await habitsRepository.getHabitsAndCurrentActivitiesByUserId(userId);
    const { habits, currentActivities } = userHabits;

    const newId = habits.length === 0 ? 0 : habits[habits.length - 1].id + 1;
    const newHabit = {
        name: sanitizedName,
        days: habitDays,
        id: newId,
        currentSequence: 0,
        highestSequence: 0,
    };

    const weekday = getWeekdayByUtc(utcOffset);

    if (habitDays.includes(weekday)) {
        const currentDay = getDateByUtc(utcOffset);
        await updatecurrentActivities(userId, newHabit, currentActivities, currentDay);
        return;
    }
    await habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit });
}

async function getByUserId(userId) {
    const userHabits = await habitsRepository.getByUserId(userId);
    return userHabits;
}

async function deleteByHabitId(userId, utcOffset, habitId) {
    if (isNaN(habitId)) {
        throw { type: "badRequest", message: "Invalid id format" };
    }

    const userHabits = await habitsRepository.getHabitsAndCurrentActivitiesByUserId(userId);
    const { habits, currentActivities } = userHabits;

    const habitIndex = habits.findIndex((habit) => habit.id === habitId);
    if (habitIndex === -1) {
        throw { type: "notFound", message: "Habit not found" };
    }

    const habit = habits[habitIndex];
    const weekday = getWeekdayByUtc(utcOffset);
    habits.splice(habitIndex, 1);

    if (habit.days.includes(weekday)) {
        currentActivities.habits = currentActivities.habits.filter((habit) => habit.id !== habitId);
        if (currentActivities.habits.length === 0) {
            await habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits, currentActivities: {} });
        }
        await habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits, currentActivities });
        return;
    }
    await habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits });
    return;
}

const habitsService = {
    create,
    getByUserId,
    deleteByHabitId,
};
export default habitsService;
