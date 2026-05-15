import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";

// POST add comment to task
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Members can only comment on their own tasks
    if (authResult.role === "member" && task.assignedTo.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    task.comments.push({
      user: authResult.userId as unknown as import("mongoose").Types.ObjectId,
      text,
      createdAt: new Date(),
    });
    await task.save();

    await ActivityLog.create({
      user: authResult.userId,
      action: "COMMENT_ADDED",
      details: `Added comment on task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    const updated = await Task.findById(id)
      .populate("comments.user", "name email avatar");

    return NextResponse.json({ comments: updated?.comments });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
