import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import RescheduleRequest from "@/models/RescheduleRequest";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";

// GET reschedule requests
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (authResult.role === "member") {
      filter.requestedBy = authResult.userId;
    }
    if (status) filter.status = status;

    const requests = await RescheduleRequest.find(filter)
      .populate("task", "title status deadline")
      .populate("requestedBy", "name email avatar")
      .populate("respondedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get reschedule requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create reschedule request (member only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { taskId, proposedDeadline, reason } = await req.json();

    if (!taskId || !proposedDeadline || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (authResult.role === "member" && task.assignedTo.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check for existing pending request
    const existingRequest = await RescheduleRequest.findOne({
      task: taskId,
      requestedBy: authResult.userId,
      status: "pending",
    });
    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request for this task" }, { status: 409 });
    }

    const rescheduleReq = await RescheduleRequest.create({
      task: taskId,
      requestedBy: authResult.userId,
      currentDeadline: task.deadline,
      proposedDeadline: new Date(proposedDeadline),
      reason,
    });

    // Notify all admins
    const { default: User } = await import("@/models/User");
    const admins = await User.find({ role: "admin", isActive: true });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title: "New Reschedule Request",
      message: `Reschedule requested for task "${task.title}"`,
      type: "general" as const,
      link: "/dashboard/reschedule",
    }));
    await Notification.insertMany(notifications);

    await ActivityLog.create({
      user: authResult.userId,
      action: "RESCHEDULE_REQUESTED",
      details: `Requested reschedule for task "${task.title}"`,
      entityType: "reschedule",
      entityId: rescheduleReq._id,
    });

    return NextResponse.json({ request: rescheduleReq }, { status: 201 });
  } catch (error) {
    console.error("Create reschedule request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT respond to reschedule request (admin only)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { requestId, status: newStatus, responseNote } = await req.json();

    if (!requestId || !newStatus || !["approved", "rejected"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const rescheduleReq = await RescheduleRequest.findById(requestId).populate("task");
    if (!rescheduleReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (rescheduleReq.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    rescheduleReq.status = newStatus;
    rescheduleReq.respondedBy = authResult.userId as unknown as import("mongoose").Types.ObjectId;
    rescheduleReq.respondedAt = new Date();
    rescheduleReq.responseNote = responseNote;
    await rescheduleReq.save();

    // If approved, update task deadline
    if (newStatus === "approved") {
      await Task.findByIdAndUpdate(rescheduleReq.task._id, {
        deadline: rescheduleReq.proposedDeadline,
      });
    }

    // Notify the requester
    await Notification.create({
      user: rescheduleReq.requestedBy,
      title: `Reschedule ${newStatus === "approved" ? "Approved" : "Rejected"}`,
      message: `Your reschedule request has been ${newStatus}${responseNote ? `: ${responseNote}` : ""}`,
      type: "reschedule_response",
      link: `/dashboard/tasks/${rescheduleReq.task._id}`,
    });

    await ActivityLog.create({
      user: authResult.userId,
      action: `RESCHEDULE_${newStatus.toUpperCase()}`,
      details: `${newStatus} reschedule request for task`,
      entityType: "reschedule",
      entityId: rescheduleReq._id,
    });

    return NextResponse.json({ request: rescheduleReq });
  } catch (error) {
    console.error("Respond to reschedule error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
