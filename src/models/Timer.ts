import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITimeEntry extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  taskId: Types.ObjectId;
  startTime: Date;
  endTime?: Date ;
  duration?: number; 
  isRunning: boolean;
}

const TimeEntrySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, 
    isRunning: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);

export default mongoose.model<ITimeEntry>("TimeEntry", TimeEntrySchema);
