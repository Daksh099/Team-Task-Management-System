import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRescheduleRequest extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  currentDeadline: Date;
  proposedDeadline: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
  responseNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RescheduleRequestSchema = new Schema<IRescheduleRequest>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentDeadline: { type: Date, required: true },
    proposedDeadline: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
    responseNote: { type: String },
  },
  { timestamps: true }
);

RescheduleRequestSchema.index({ status: 1 });
RescheduleRequestSchema.index({ requestedBy: 1 });

const RescheduleRequest: Model<IRescheduleRequest> =
  mongoose.models.RescheduleRequest ||
  mongoose.model<IRescheduleRequest>("RescheduleRequest", RescheduleRequestSchema);
export default RescheduleRequest;
