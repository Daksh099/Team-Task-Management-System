import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";

// GET single task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const task = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email avatar");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Members can only view their own tasks
    if (authResult.role === "member" && task.assignedTo._id.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update task
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Members can only update status of their own tasks
    if (authResult.role === "member") {
      if (task.assignedTo.toString() !== authResult.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Members can only change status
      const allowedFields = ["status"];
      const updates: Record<string, string> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) updates[field] = body[field];
      }
      if (updates.status === "completed") {
        (updates as Record<string, unknown>).completedAt = new Date();
      }
      Object.assign(task, updates);
    } else {
      // Admin can update everything
      const { title, description, priority, assignedTo, deadline, status } = body;
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (assignedTo) task.assignedTo = assignedTo;
      if (deadline) task.deadline = new Date(deadline);
      if (status) {
        task.status = status;
        if (status === "completed") task.completedAt = new Date();
      }
    }

    await task.save();

    // Log activity
    await ActivityLog.create({
      user: authResult.userId,
      action: "TASK_UPDATED",
      details: `Updated task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    // Notify if status changed
    if (body.status) {
      const targetUser =
        authResult.role === "admin" ? task.assignedTo.toString() : task.createdBy.toString();
      await Notification.create({
        user: targetUser,
        title: "Task Updated",
        message: `Task "${task.title}" status changed to ${body.status}`,
        type: "task_updated",
        link: `/dashboard/tasks/${task._id}`,
      });
    }

    const updated = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email");

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE task (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await Task.findByIdAndDelete(id);

    await ActivityLog.create({
      user: authResult.userId,
      action: "TASK_DELETED",
      details: `Deleted task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
