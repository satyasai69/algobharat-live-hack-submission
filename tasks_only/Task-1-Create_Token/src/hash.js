import fs from "fs";
import { createHash } from "crypto";

const data = fs.readFileSync("./src/metadata.json");
const hash = createHash("sha256").update(data).digest("hex");
console.log(hash);
