import { db } from "@/server";
import { UserData } from "@/protocols/users.protocol";
import { User } from "@/protocols/auth.protocol";

type QueryContent = {
    $set?: {
        currentActivities?: UserData["currentActivities"] | {};
        habits?: UserData["habits"];
    };
    $push?: {
        historyEntry?: UserData["historyEntry"];
    };
}

export type QueryToUpdateUser = {
    updateOne: {
        filter: { userId: number };
        update: QueryContent;
    };
}

function newQueryToUpdateUserData(userId: number, data: UserData): QueryToUpdateUser {
    const { currentActivities, habits, historyEntry } = data;
    let content: QueryContent;

    if (currentActivities && habits) {
        content = { $set: { currentActivities, habits } };
    } else if (currentActivities) {
        content = { $set: { currentActivities } };
    } else if (habits) {
        content = { $set: { habits, currentActivities: {} } };
    } else if (historyEntry) {
        content = { $push: { historyEntry } };
    }

    return { updateOne: { filter: { userId }, update: content }};
}

function getUsersByUtcOffset(utcOffset: number): Promise<User[]> {
    return db.collection("users").find({ utcOffset }).toArray();
}

function getUsersHabitsAndCurrentActivities(usersIds: string[]): Promise<UserData[]> {
    return db
        .collection("usersHabits")
        .find({ userId: { $in: usersIds } })
        .toArray();
}

function executeBulkWrite(collection: string, data: QueryToUpdateUser[]) {
    return db.collection(collection).bulkWrite(data);
}

function updateUsersWeekday(usersIds: string[], lastWeekday: number) {
    return db.collection("users").updateMany({ _id: { $in: usersIds } }, { $set: { lastWeekday } });
}

export const usersRepository = {
    newQueryToUpdateUserData,
    getUsersByUtcOffset,
    getUsersHabitsAndCurrentActivities,
    executeBulkWrite,
    updateUsersWeekday,
};
