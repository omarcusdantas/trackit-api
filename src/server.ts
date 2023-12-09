import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { app } from "./app";

dotenv.config();
export const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;

// Cyclic(https://www.cyclic.sh/) requires that the connection with MongoDB is stablished before app.listen is called
async function connectWithMongoDBAndStartServer() {
    try {
        await mongoClient.connect();
        console.log("MongoDB Connected!");
        db = mongoClient.db();
        const PORT = Number(process.env.PORT) || 5000;
    
        app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
    }
}

connectWithMongoDBAndStartServer();
