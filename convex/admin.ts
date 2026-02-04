import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all user roles - this is our source of truth for managed users
    const userRoles = await ctx.db.query("userRoles").collect();

    // Return simplified user info based on userRoles
    // We can't easily access Better Auth user data, so just show userId and role
    return userRoles.map((roleRecord) => ({
      _id: roleRecord.userId,
      name: `User ${roleRecord.userId.slice(-8)}`, // Show last 8 chars of ID
      email: roleRecord.userId, // Show full userId as "email" for now
      role: roleRecord.role,
    }));
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

export const addUserByEmail = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if they already have a role
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing role
      await ctx.db.patch(existing._id, { role: args.role });
      return { success: true, message: `Updated user to ${args.role}` };
    } else {
      // Create new role entry
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
      });
      return { success: true, message: `Added user as ${args.role}` };
    }
  },
});

