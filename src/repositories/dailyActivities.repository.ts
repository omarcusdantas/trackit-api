import { ObjectId } from "mongodb";
import { db } from "@/server";
import { CurrentActivities } from "@/protocols/habits.protocol";

async function readByUserId(userId: number): Promise<CurrentActivities> {
    const userHabits = await db
        .collection("usersHabits")
        .findOne({ userId: new ObjectId(userId) }, { projection: { currentActivities: 1 } });
    const { currentActivities } = userHabits;
    return currentActivities;
}

function updateByUserId(userId: number, currentActivities: CurrentActivities) {
    return db
        .collection("usersHabits")
        .updateOne({ userId: new ObjectId(userId) }, { $set: { currentActivities } });
}

export const dailyActivitiesRepository = {
    readByUserId,
    updateByUserId,
};
