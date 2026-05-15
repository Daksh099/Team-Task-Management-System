import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  deadline: Date;
  completedAt?: Date;
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true },
    completedAt: { type: Date },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ createdBy: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
export default Task;
