import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import Notification from "@/models/Notification";

// GET user notifications
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { user: authResult.userId };
    if (unreadOnly) filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: authResult.userId,
      read: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT mark notifications as read
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { notificationIds, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany(
        { user: authResult.userId, read: false },
        { read: true }
      );
    } else if (notificationIds?.length) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, user: authResult.userId },
        { read: true }
      );
    }

    return NextResponse.json({ message: "Notifications updated" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
