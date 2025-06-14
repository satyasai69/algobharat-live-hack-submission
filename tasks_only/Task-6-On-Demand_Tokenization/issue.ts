import { createASA, hashEmail } from "./utils.js";
import { connectDB, Tokens } from "./db.js";
import algosdk from "algosdk";
import fs from "fs";

// Read metadata from JSON file
const metadata = JSON.parse(fs.readFileSync("./metadata.json", "utf8"));

const userEmail = "testuser@rivalz.ai";
const userId = hashEmail(userEmail);

const creator = algosdk.generateAccount();

console.log("Creating asset for user:", userId);
await connectDB();

const assetId = await createASA(creator, metadata);

await Tokens.insertOne({
  userId,
  originalAssetId: assetId,
  metadata,
  issuedAt: Date.now(),
  reissues: 0,
});

console.log("✅ Token created with ID:", assetId);
