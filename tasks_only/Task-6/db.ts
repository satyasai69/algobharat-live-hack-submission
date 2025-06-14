import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI!);
export const db = client.db(process.env.MONGO_DB || "reissuer");
export const Tokens = db.collection("tokens");

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
