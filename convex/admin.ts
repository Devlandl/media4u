import { mutation } from "./_generated/server";
import { v } from "convex/values";

function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const loginWithPassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user with matching password
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => verifyPassword(args.password, u.password));

    if (!user) {
      return {
        success: false,
        error: "Invalid password",
      };
    }

    // Create session token using user ID
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString("base64");

    return {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});
