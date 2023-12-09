import { ObjectId } from "mongodb";
import { db } from "@/server";
import { History } from "@/protocols/history.protocol";

function getByUserId(id: number): Promise<{ history: History}> {
    return db.collection("usersHistory").findOne({ userId: new ObjectId(id) });
}

export const historyRepository = {
    getByUserId,
};
