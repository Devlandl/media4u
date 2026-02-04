import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all user roles first
    const userRoles = await ctx.db.query("userRoles").collect();

    // Get user details from Better Auth for each user with a role
    const usersWithDetails = await Promise.all(
      userRoles.map(async (roleRecord) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const user = await ctx.db.get(roleRecord.userId as any);
          if (user) {
            return {
              _id: roleRecord.userId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: (user as any).name || "Unknown",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              email: (user as any).email || "No email",
              role: roleRecord.role,
            };
          }
        } catch {
          // User not found in auth tables
        }
        return null;
      })
    );

    return usersWithDetails.filter((u) => u !== null);
  },
});

export const getAllUserRoles = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("userRoles").collect();
  },
});

export const checkAdminAccess = internalMutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
  },
});

export const setUserRoleInternal = internalMutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
      });
    }
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Hash the password using bcrypt (Better Auth style)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(args.password, 10);

    // Create the user in the Better Auth users table
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      emailVerified: false,
      image: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create the password record
    await ctx.db.insert("passwords", {
      userId: userId as string,
      password: hashedPassword,
    });

    // Set the user's role
    await ctx.db.insert("userRoles", {
      userId: userId as string,
      role: args.role,
      createdAt: Date.now(),
    });

    return { success: true, userId };
  },
});
