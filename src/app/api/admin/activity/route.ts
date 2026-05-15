import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/middleware/auth";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const entityType = searchParams.get("entityType");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (entityType) filter.entityType = entityType;

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
