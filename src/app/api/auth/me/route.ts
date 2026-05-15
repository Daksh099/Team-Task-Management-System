import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const user = await User.findById(authResult.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
