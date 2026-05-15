import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  details: string;
  entityType: "task" | "user" | "reschedule" | "auth";
  entityId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["task", "user", "reschedule", "auth"],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ user: 1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
