import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple password hashing - just use base64 encoding for storage
function hashPassword(password: string): string {
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    // Validate inputs
    if (args.password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (args.name.trim().length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters",
      };
    }

    // Create user with 'user' role by default
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: hashPassword(args.password),
      name: args.name,
      role: "user",
      createdAt: Date.now(),
    });

    return {
      success: true,
      userId,
      message: "Account created successfully",
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || !verifyPassword(args.password, user.password)) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Create a session token
    const token = btoa(`${user._id}:${Date.now()}`);

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

export const verifyToken = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { valid: false, user: null };
    }

    try {
      const decoded = atob(args.token);
      const [userId] = decoded.split(":");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await ctx.db.get(userId as any) as any;

      if (!user || !("email" in user)) {
        return { valid: false, user: null };
      }

      return {
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch {
      return { valid: false, user: null };
    }
  },
});

export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    try {
      const decoded = atob(args.token);
      const [userId] = decoded.split(":");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await ctx.db.get(userId as any) as any;

      if (!user || !("email" in user)) {
        return null;
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch {
      return null;
    }
  },
});
