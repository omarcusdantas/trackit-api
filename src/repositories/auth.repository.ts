import { db, mongoClient } from "@/server";
import { SignupData, User } from "@/protocols/auth.protocol";

function getUserByEmail(email: string): Promise<User> {
    return db.collection("users").findOne({ email });
}

async function createUser(user: SignupData) {
    const session = mongoClient.startSession();
    await session.withTransaction(async () => {
        const newUser = await db.collection("users").insertOne(user);
        const userId = newUser.insertedId;

        await db.collection("usersHabits").insertOne({
            userId,
            habits: [],
            currentActivities: {},
        });

        await db.collection("usersHistory").insertOne({
            userId,
            history: [],
        });
    });
    return session.endSession();
}

export const authRepository = {
    getUserByEmail,
    createUser,
};
