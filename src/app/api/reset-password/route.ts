import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { hash } from "bcrypt";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenCheck = await convex.mutation(api.passwordReset.verifyResetToken, {
      token,
    });

    if (!tokenCheck.valid) {
      return NextResponse.json(
        { error: tokenCheck.error || "Invalid token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the password in the database
    await convex.mutation(api.passwordReset.updatePasswordDirect, {
      email: tokenCheck.email!,
      passwordHash: hashedPassword,
    });

    // Mark token as used
    await convex.mutation(api.passwordReset.markTokenAsUsed, {
      token,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
