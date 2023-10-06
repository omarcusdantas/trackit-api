import { db } from "../app.js";

function newQuery(userId, data) {
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

async function getUsersByUtcOffset(utcOffset) {
    return db.collection("users").find({ utcOffset }).toArray();
}

async function getUsersHabitsAndCurrentActivities(users) {
    return db
        .collection("usersHabits")
        .find({ userId: { $in: users } })
        .toArray();
}

async function executeBulkWrite(collection, data) {
    return db.collection(collection).bulkWrite(data);
}

async function updateUsersWeekday(users, lastWeekday) {
    return db.collection("users").updateMany({ _id: { $in: users } }, { $set: { lastWeekday } });
}

const updateRepository = {
    newQuery,
    getUsersByUtcOffset,
    getUsersHabitsAndCurrentActivities,
    executeBulkWrite,
    updateUsersWeekday,
};
export default updateRepository;
