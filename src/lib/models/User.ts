import mongoose, { Schema, models, model } from "mongoose";
import type { Role } from "@/lib/rbac";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  workspaceId: mongoose.Types.ObjectId;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "SUB_ADMIN", "PROJECT_MANAGER", "MEMBER", "VIEWER"],
      default: "MEMBER",
      required: true,
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    avatarUrl: { type: String },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ workspaceId: 1 });

// Prevents Mongoose "OverwriteModelError" during Next.js hot-reload
export const User = models.User || model<IUser>("User", UserSchema);