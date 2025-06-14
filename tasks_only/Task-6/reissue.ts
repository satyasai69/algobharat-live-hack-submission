import { Tokens, connectDB } from "./db.js";
import { createASA, hashEmail } from "./utils.js";
import algosdk from "algosdk";
import dotenv from "dotenv";
dotenv.config();

const REISSUE_LIMIT = parseInt(process.env.REISSUE_LIMIT || "1");
const REISSUE_LOCK = parseInt(process.env.REISSUE_LOCK || "86400");

const userEmail = "testuser@rivalz.ai";
const userId = hashEmail(userEmail);

await connectDB();

const token = await Tokens.findOne({ userId });

if (!token) throw new Error("No record found for user");

const now = Date.now();
if (token.reissues >= REISSUE_LIMIT)
  throw new Error("User has exhausted reissue limit");

if (now - token.issuedAt < REISSUE_LOCK * 1000)
  throw new Error("Token is locked. Try later.");

const creator = algosdk.generateAccount();

const newAssetId = await createASA(creator, token.metadata);

await Tokens.updateOne(
  { userId },
  {
    $set: {
      issuedAt: now,
      originalAssetId: newAssetId,
    },
    $inc: {
      reissues: 1,
    },
  }
);

console.log("✅ Token re-issued with ID:", newAssetId);
