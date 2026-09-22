import dns from 'dns'; // Set DNS servers to Google's public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']); 

import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set. Did you create .env?");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  const TestSchema = new mongoose.Schema({ message: String, createdAt: Date });
  const TestModel = mongoose.models.__ConnectionTest || mongoose.model("__ConnectionTest", TestSchema);

  console.log("Writing a test document...");
  const doc = await TestModel.create({ message: "Step 0 verification", createdAt: new Date() });
  console.log("✅ Wrote document:", doc._id.toString());

  const found = await TestModel.findById(doc._id);
  if (!found) throw new Error("Could not read back the document.");
  console.log("✅ Read back:", found.message);

  await TestModel.deleteOne({ _id: doc._id });
  console.log("✅ Cleaned up.");

  await mongoose.disconnect();
  console.log("\n✅ MongoDB connection verified. Step 0 is complete.");
}

main().catch((err) => {
  console.error("\n❌ FAILED:", err.message);
  console.error("Common causes: wrong password, IP not whitelisted in Atlas Network Access, typo in URI.");
  process.exit(1);
});