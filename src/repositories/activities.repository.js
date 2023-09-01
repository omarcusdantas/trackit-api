import { db } from "../app.js";
import { ObjectId } from "mongodb";

// Retrieves user's currentActivities
export async function getDailyHabitsByUserId(id) {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(id) }, { projection: { currentActivities: 1 } });
    const { currentActivities } = userHabits;
    return currentActivities;
}

// Updates user's currentActivities
export async function updateCurrentActivities(userId, currentActivities) {
    await db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $set: { currentActivities } });
}
