import { db } from "../app.js";
import { ObjectId } from "mongodb";

// Insert new habit and updates currentActivities if needed
export async function insertNewHabit(userId, data) {
    const { newHabit, currentActivities } = data;

    if (newHabit && currentActivities) {
        await db.collection("usersHabits").updateOne(
            { userId: new ObjectId(userId) },
            {
                $push: { habits: newHabit },
                $set: { currentActivities },
            }
        );
        return;
    } else if (newHabit) {
        await db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $push: { habits: data[0] } });
    }
}

// Retrieves user's list of habits and currentActivities
export async function getHabitsByUserId(id) {
    return await db.collection("usersHabits").findOne({ userId: new ObjectId(id) });
}

// Retrieves user's list of habits
export async function getHabitsList(userId) {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(userId) }, { projection: { habits: 1 } });
    return userHabits.habits;
}

// Updates user's habits and currentActivities
export async function updateHabits(userId, data) {
    const { habits, currentActivities } = data;

    if (habits && currentActivities) {
        await db
            .collection("usersHabits")
            .updateOne({ userId: new ObjectId(userId) }, { $set: { habits, currentActivities } });
        return;
    } else if (habits) {
        await db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $set: { habits } });
    }
}
