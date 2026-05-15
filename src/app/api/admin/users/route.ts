import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/middleware/auth";
import User from "@/models/User";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";

// GET all users (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    // Get task counts per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalTasks = await Task.countDocuments({ assignedTo: user._id });
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "completed",
        });
        return {
          ...user.toObject(),
          id: user._id.toString(),
          totalTasks,
          completedTasks,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update user (admin only)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { userId, role, isActive } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deactivating yourself
    if (userId === authResult.userId && isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    await ActivityLog.create({
      user: authResult.userId,
      action: "USER_UPDATED",
      details: `Updated user ${user.name}: role=${user.role}, active=${user.isActive}`,
      entityType: "user",
      entityId: user._id,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
