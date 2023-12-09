import { ObjectId } from "mongodb";
import { db } from "@/server";
import { NewHabitAndCurrentActivities, HabitsAndCurrenctActivities, Habit } from "@/protocols/habits.protocol";

function createHabitAndUpdateCurrentActivities(userId: number, data: NewHabitAndCurrentActivities) {
    const { newHabit, currentActivities } = data;

    if (newHabit && currentActivities) {
        return db.collection("usersHabits").updateOne(
            { userId: new ObjectId(userId) },
            {
                $push: { habits: newHabit },
                $set: { currentActivities },
            }
        );
    }
    return db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $push: { habits: newHabit } });
}

function getHabitsAndCurrentActivitiesByUserId(id: number): Promise<HabitsAndCurrenctActivities> {
    return db.collection("usersHabits").findOne({ userId: new ObjectId(id) });
}

async function getByUserId(userId: number): Promise<Habit[]> {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(userId) }, { projection: { habits: 1 } });
    return userHabits.habits;
}

function updateHabitsAndCurrentActivitiesByUserId(
    userId: number,
    data: HabitsAndCurrenctActivities | { currentActivities: {}; habits: {} }
) {
    const { habits, currentActivities } = data;

    if (habits && currentActivities) {
        return db
            .collection("usersHabits")
            .updateOne({ userId: new ObjectId(userId) }, { $set: { habits, currentActivities } });
    }
    return db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $set: { habits } });
}

export const habitsRepository = {
    createHabitAndUpdateCurrentActivities,
    getHabitsAndCurrentActivitiesByUserId,
    getByUserId,
    updateHabitsAndCurrentActivitiesByUserId,
};
