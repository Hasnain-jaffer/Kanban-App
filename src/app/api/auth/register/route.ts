import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Workspace } from "@/lib/models/Workspace";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(1),
  // Note: no "role" field accepted here, on purpose. Per our security rule,
  // the public registration endpoint always creates a MEMBER — nothing else.
  // Role elevation only happens through an authenticated admin action later.
});

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, workspaceName } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const slug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the workspace first (needs an owner id), then the user, then
  // patch the workspace's ownerId — a small two-step dance because Mongo
  // has no transactions-by-default across separate inserts like this for a
  // brand new workspace/owner pair.
  const workspace = await Workspace.create({ name: workspaceName, slug, ownerId: null });

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "MEMBER", // hardcoded — never trust a client-supplied role
    workspaceId: workspace._id,
  });

  workspace.ownerId = user._id;
  await workspace.save();

  return NextResponse.json({ userId: user._id, workspaceId: workspace._id }, { status: 201 });
}