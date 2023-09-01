import { getDate, getWeekday } from "../getUserDate.js";
import { updateHabits, getHabitsByUserId, insertNewHabit, getHabitsList } from "../repositories/habits.repository.js";

// Updates current activities if new habit affects its habits
async function updatecurrentActivities(userId, newHabit, currentActivities, currentDay) {
    // Inserts into current activities' habits
    if (currentActivities?.date === currentDay) {
        currentActivities.habits.push({
            name: newHabit.name,
            done: false,
            id: newHabit.id,
            highestSequence: 0,
            currentSequence: 0,
        });
        await insertNewHabit(userId, { newHabit, currentActivities });
        return;
    }

    // Sets current activities
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
    await insertNewHabit(userId, { newHabit, currentActivities: newCurrent });
}

// Adds new habit
export async function addHabit(req, res) {
    const { userId, utcOffset } = res.locals.user;
    const { name, days } = req.body;
    const sanitizedName = stripHtml(name.toString()).result.trim();

    try {
        const userHabits = await getHabitsByUserId(userId);
        const { habits, currentActivities } = userHabits;
        const newId = habits.length === 0 ? 0 : habits[habits.length - 1].id + 1;
        const newHabit = {
            name: sanitizedName,
            days,
            id: newId,
            currentSequence: 0,
            highestSequence: 0,
        };

        const weekday = getWeekday(utcOffset);
        // Checks if new habit affects current activities
        if (days.includes(weekday)) {
            const currentDay = getDate(utcOffset);
            await updatecurrentActivities(userId, newHabit, currentActivities, currentDay);
            return res.sendStatus(201);
        }

        await insertNewHabit(userId, { newHabit });
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Gets list of user's habits
export async function getHabits(req, res) {
    const { userId } = res.locals.user;

    try {
        const userHabits = await getHabitsList(userId);
        return res.send(userHabits);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// Deletes a habit by id
export async function deleteHabit(req, res) {
    const id = parseInt(req.params.id);
    const { userId, utcOffset } = res.locals.user;

    if (isNaN(id)) {
        return res.status(400).send("Insert a valid id");
    }

    try {
        const userHabits = await getHabitsByUserId(userId);
        const { habits, currentActivities } = userHabits;

        const habitIndex = habits.findIndex((habit) => habit.id === id);
        if (habitIndex === -1) {
            return res.status(404).send("Habit not found");
        }

        const habit = habits[habitIndex];
        const weekday = getWeekday(utcOffset);
        habits.splice(habitIndex, 1);

        // Updates currentActivities if excluded habit affects its habits
        if (habit.days.includes(weekday)) {
            currentActivities.habits = currentActivities.habits.filter((habit) => habit.id !== id);
            // Empties currentActivities if the excluded habit was the only one
            if (currentActivities.habits.length === 0) {
                await updateHabits(userId, { habits, currentActivities: {} });
                return res.sendStatus(204);
            }
            await updateHabits(userId, { habits, currentActivities });
            return res.sendStatus(204);
        }

        await updateHabits(userId, { habits });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
