import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  // Also check cookies
  const tokenCookie = req.cookies.get("accessToken");
  return tokenCookie?.value ?? null;
}

export function authenticateUser(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JWTPayload | NextResponse {
  const user = authenticateUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function requireAdmin(req: NextRequest): JWTPayload | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return result;
}
