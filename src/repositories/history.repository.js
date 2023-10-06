import { ObjectId } from "mongodb";
import { db } from "../app.js";

async function getByUserId(id) {
    return db.collection("usersHistory").findOne({ userId: new ObjectId(id) });
}

const historyRepository = {
    getByUserId,
};
export default historyRepository;
