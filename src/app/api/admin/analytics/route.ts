import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/middleware/auth";
import Task from "@/models/Task";
import User from "@/models/User";
import RescheduleRequest from "@/models/RescheduleRequest";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalMembers,
      activeMembers,
      pendingReschedules,
      highPriorityTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
    ] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments({ status: { $ne: "completed" }, deadline: { $lt: new Date() } }),
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "member", isActive: true }),
      RescheduleRequest.countDocuments({ status: "pending" }),
      Task.countDocuments({ priority: "high" }),
      Task.countDocuments({ priority: "low" }),
      Task.countDocuments({ priority: "medium" }),
    ]);

    // Tasks completed per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tasks created per day (last 7 days)
    const creationTrend = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top performers
    const topPerformers = await Task.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          completedTasks: "$count",
        },
      },
    ]);

    return NextResponse.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalMembers,
        activeMembers,
        pendingReschedules,
        priorityBreakdown: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks,
        },
      },
      completionTrend,
      creationTrend,
      topPerformers,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
