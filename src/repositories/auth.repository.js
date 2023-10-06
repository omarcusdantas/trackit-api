import { db } from "../app.js";

async function getByEmail(email) {
    return db.collection("users").findOne({ email });
}

async function create(user) {
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

const authRepository = {
    getByEmail,
    create,
};
export default authRepository;
