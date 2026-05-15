import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";

// GET all tasks (admin sees all, member sees only assigned)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    // Members can only see their own tasks
    if (authResult.role === "member") {
      filter.assignedTo = authResult.userId;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new task (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { title, description, priority, assignedTo, deadline } = await req.json();

    if (!title || !description || !assignedTo || !deadline) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Verify assignee exists
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      assignedTo,
      createdBy: authResult.userId,
      deadline: new Date(deadline),
    });

    // Create notification for assignee
    await Notification.create({
      user: assignedTo,
      title: "New Task Assigned",
      message: `You've been assigned: "${title}"`,
      type: "task_assigned",
      link: `/dashboard/tasks/${task._id}`,
    });

    // Log activity
    await ActivityLog.create({
      user: authResult.userId,
      action: "TASK_CREATED",
      details: `Created task "${title}" and assigned to ${assignee.name}`,
      entityType: "task",
      entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email");

    return NextResponse.json({ task: populated }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
