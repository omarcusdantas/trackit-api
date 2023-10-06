import { ObjectId } from "mongodb";
import { db } from "../app.js";

async function readByUserId(userId) {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(userId) }, { projection: { currentActivities: 1 } });
    const { currentActivities } = userHabits;
    return currentActivities;
}

async function updateByUserId(userId, currentActivities) {
    return db.collection("usersHabits").updateOne({ userId: new ObjectId(userId) }, { $set: { currentActivities } });
}

const dailyActivitiesRepository = {
    readByUserId,
    updateByUserId,
};
export default dailyActivitiesRepository;
