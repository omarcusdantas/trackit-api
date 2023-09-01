import { db } from "../app.js";

// Sends specific field query update for bulk write
export function updateQuery(userId, data) {
    const { currentActivities, habits, history } = data;
    let content;

    if (currentActivities && habits) {
        content = { $set: { currentActivities, habits } };
    } else if (currentActivities) {
        content = { $set: { currentActivities } };
    } else if (habits) {
        content = { $set: { habits, currentActivities: {} } };
    } else if (history) {
        content = { $push: { history } };
    }

    return {
        updateOne: {
            filter: { userId },
            update: content,
        },
    };
}

// Searches users by utc offset
export async function getUsersByUtcOffset(utcOffset) {
    return await db.collection("users").find({ utcOffset }).toArray();
}

// Gets habits of multiple users
export async function getUsersHabits(users) {
    return await db
        .collection("usersHabits")
        .find({ userId: { $in: users } })
        .toArray();
}

// Executes queries for specific collection
export async function executeBulkWrite(collection, data) {
    await db.collection(collection).bulkWrite(data);
}

// Updates lastWeekday of multiple users
export async function updateUsersWeekday(users, lastWeekday) {
    await db.collection("users").updateMany({ _id: { $in: users } }, { $set: { lastWeekday } });
}
