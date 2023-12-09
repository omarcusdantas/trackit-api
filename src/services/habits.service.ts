import { stripHtml } from "string-strip-html";
import { habitsRepository } from "@/repositories/habits.repository";
import { getWeekdayByUtc, getDateByUtc } from "@/utils/dateByUtc";
import { HabitInput, CurrentActivities, Habit } from "@/protocols/habits.protocol";

type UpdateCurrentActivitiesData = {
    userId: number;
    newHabit: Habit;
    currentActivities: CurrentActivities;
    currentDay: string;
};

type DeleteAndUpdateData = {
    habits: Habit[];
    currentActivities: CurrentActivities;
    habit: Habit;
    habitId: number;
    userId: number;
    utcOffset: number;
}

function generateActivityData(name: string, id: number) {
    return {
        name,
        done: false,
        id,
        currentSequence: 0,
        highestSequence: 0,
    };
}

function updatecurrentActivities(data: UpdateCurrentActivitiesData) {
    const { userId, newHabit, currentActivities, currentDay } = data;

    if (currentActivities?.date === currentDay) {
        currentActivities.habits.push(generateActivityData(newHabit.name, newHabit.id));
        return habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit, currentActivities });
    }
    const newCurrent = {
        date: currentDay,
        habits: [ generateActivityData(newHabit.name, newHabit.id) ],
    };
    return habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit, currentActivities: newCurrent });
}

async function create(data: HabitInput, userId: number, utcOffset: number) {
    const { name, days } = data;
    const sanitizedName = stripHtml(name.toString()).result.trim();
    const userHabits = await habitsRepository.getHabitsAndCurrentActivitiesByUserId(userId);
    const { habits, currentActivities } = userHabits;

    const newId = habits.length === 0 ? 0 : habits[habits.length - 1].id + 1;
    const newHabit = { name: sanitizedName, days, id: newId, currentSequence: 0, highestSequence: 0 };

    const weekday = getWeekdayByUtc(utcOffset);

    if (days.includes(weekday)) {
        const currentDay = getDateByUtc(utcOffset);
        return updatecurrentActivities({ userId, newHabit, currentActivities, currentDay });
    }
    return habitsRepository.createHabitAndUpdateCurrentActivities(userId, { newHabit });
}

function getByUserId(userId: number) {
    return habitsRepository.getByUserId(userId);
}

function deleteHabitAndUpdateCurrentActivities(data: DeleteAndUpdateData) {
    const { userId, habitId, utcOffset, habits, currentActivities, habit } = data;
    const weekday = getWeekdayByUtc(utcOffset);

    if (habit.days.includes(weekday)) {
        currentActivities.habits = currentActivities.habits.filter((habit) => habit.id !== habitId);
        if (currentActivities.habits.length === 0) {
            return habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits, currentActivities: {} });
        }
        return habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits, currentActivities });
    }
    return habitsRepository.updateHabitsAndCurrentActivitiesByUserId(userId, { habits });
}

async function deleteById(userId: number, utcOffset: number, habitId: number) {
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
    habits.splice(habitIndex, 1);
    return deleteHabitAndUpdateCurrentActivities({ habits, currentActivities, habit, habitId, userId, utcOffset });
}

const habitsService = {
    create,
    getByUserId,
    deleteById,
};
export default habitsService;
