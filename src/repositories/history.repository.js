import { db } from "../app.js";
import { ObjectId } from "mongodb";

// Retrieves user' history
export async function getHistoryByUserId(id) {
    return await db.collection("usersHistory").findOne({ userId: new ObjectId(id) });
}