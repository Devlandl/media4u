import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const login = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.password === ADMIN_PASSWORD) {
      return {
        success: true,
        token: Buffer.from(`admin:${Date.now()}`).toString("base64"),
      };
    }
    return {
      success: false,
      error: "Invalid password",
    };
  },
});

export const verifyToken = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { valid: false };
    }

    try {
      const decoded = Buffer.from(args.token, "base64").toString();
      if (decoded.startsWith("admin:")) {
        return { valid: true };
      }
    } catch {
      return { valid: false };
    }

    return { valid: false };
  },
});
