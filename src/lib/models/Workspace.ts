import mongoose, { Schema, models, model } from "mongoose";

export interface IWorkspace {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  ownerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" }, // not required — set after the owner user is created
  },
  { timestamps: true }
);

export const Workspace = models.Workspace || model<IWorkspace>("Workspace", WorkspaceSchema);