import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "task_assigned" | "task_updated" | "reschedule_response" | "deadline_reminder" | "general";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["task_assigned", "task_updated", "reschedule_response", "deadline_reminder", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
