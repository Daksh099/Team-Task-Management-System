import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const newPayload = { userId: payload.userId, email: payload.email, role: payload.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
