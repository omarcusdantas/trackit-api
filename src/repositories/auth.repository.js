import { db } from "../app.js";

// Searches users by email
export async function getUserByEmail(email) {
    return await db.collection("users").findOne({ email });
}

// Creates new user
export async function insertNewUser(user) {
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
}
