import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  name: string;
  description?: string;
  status: "pending" | "done";
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
