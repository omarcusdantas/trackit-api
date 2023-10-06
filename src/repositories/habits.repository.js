import { ObjectId } from "mongodb";
import { db } from "../app.js";

async function createHabitAndUpdateCurrentActivities(userId, data) {
    const { newHabit, currentActivities } = data;

    if (newHabit && currentActivities) {
        return db.collection("usersHabits").updateOne(
            { userId: new ObjectId(userId) },
            {
                $push: { habits: newHabit },
                $set: { currentActivities },
            }
        );
    } else if (newHabit) {
        return db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $push: { habits: newHabit } });
    }
}

async function getHabitsAndCurrentActivitiesByUserId(id) {
    return db.collection("usersHabits").findOne({ userId: new ObjectId(id) });
}

async function getByUserId(userId) {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(userId) }, { projection: { habits: 1 } });
    return userHabits.habits;
}

async function updateHabitsAndCurrentActivitiesByUserId(userId, data) {
    const { habits, currentActivities } = data;

    if (habits && currentActivities) {
        return db
            .collection("usersHabits")
            .updateOne({ userId: new ObjectId(userId) }, { $set: { habits, currentActivities } });
    } else if (habits) {
        return db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $set: { habits } });
    }
}

const habitsRepository = {
    createHabitAndUpdateCurrentActivities,
    getHabitsAndCurrentActivitiesByUserId,
    getByUserId,
    updateHabitsAndCurrentActivitiesByUserId,
};
export default habitsRepository;
