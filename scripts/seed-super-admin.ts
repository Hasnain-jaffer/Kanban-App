import dns from 'dns'; // Set DNS servers to Google's public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']); 

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { User } from "../src/lib/models/User";
import { Workspace } from "../src/lib/models/Workspace";

async function main() {
  const { MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME } = process.env;

  if (!MONGODB_URI || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD || !SUPER_ADMIN_NAME) {
    console.error("❌ Missing MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, or SUPER_ADMIN_NAME in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log("⚠️  A user with this email already exists. Not creating a duplicate.");
    await mongoose.disconnect();
    return;
  }

  const workspace = await Workspace.create({
    name: "Platform",
    slug: `platform-${Date.now().toString(36)}`,
    ownerId: null,
  });

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const superAdmin = await User.create({
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    passwordHash,
    role: "SUPER_ADMIN",
    workspaceId: workspace._id,
    emailVerified: true,
  });

  workspace.ownerId = superAdmin._id;
  await workspace.save();

  console.log("✅ Super Admin created:", SUPER_ADMIN_EMAIL);
  console.log("   Log in at /login with the password from your .env SUPER_ADMIN_PASSWORD.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});