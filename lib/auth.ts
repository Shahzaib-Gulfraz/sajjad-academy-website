import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "./dbConnect";
import User, { IUser } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  role: "student" | "admin";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

/** Extract and verify the JWT from Authorization header or cookie */
export async function getAuthUser(
  req: NextRequest
): Promise<IUser | null> {
  // Try Authorization header first, then cookie
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user || user.status === "suspended") return null;
    return user;
  } catch {
    return null;
  }
}

/** Require an authenticated user — returns 401 if not logged in */
export async function requireAuth(
  req: NextRequest
): Promise<{ user: IUser } | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user };
}

/** Require an admin user — returns 403 if not admin */
export async function requireAdmin(
  req: NextRequest
): Promise<{ user: IUser } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

/** Set token as httpOnly cookie */
export function setTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}
