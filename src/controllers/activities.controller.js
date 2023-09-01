import { getDailyHabitsByUserId, updateCurrentActivities } from "../repositories/activities.repository.js";
import { getDate } from "../getUserDate.js";

// Gets user's habits for current day
export async function getDailyHabits(req, res) {
    const { userId, utcOffset } = res.locals.user;

    try {
        const currentActivities = await getDailyHabitsByUserId(userId);
        const currentDate = getDate(utcOffset);
        const dailyHabits = currentActivities?.date === currentDate ? currentActivities.habits : [];
        return res.send(dailyHabits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Marks the daily habit as done or undone
export async function trackHabit(req, res) {
    const { userId, utcOffset } = res.locals.user;
    const type = req.params.type;
    const id = parseInt(req.params.id);

    if (isNaN(id) || (type !== "check" && type !== "uncheck")) {
        return res.sendStatus(400);
    }

    const doneStatus = type === "check";
    try {
        const currentActivities = await getDailyHabitsByUserId(userId);
        if (currentActivities?.date !== getDate(utcOffset)) {
            return res.status(404).send("No habits for today");
        }

        const dailyHabitIndex = currentActivities.habits.findIndex((habit) => habit.id === id);
        if (dailyHabitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        const updatedHabit = currentActivities.habits[dailyHabitIndex];
        if (updatedHabit.done === doneStatus) {
            return res.status(409).send("Habit already in the desired state");
        }

        updatedHabit.done = doneStatus;
        doneStatus === true ? updatedHabit.currentSequence++ : updatedHabit.currentSequence--;
        updatedHabit.highestSequence = Math.max(updatedHabit.currentSequence, updatedHabit.highestSequence);

        await updateCurrentActivities(userId, currentActivities);
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
