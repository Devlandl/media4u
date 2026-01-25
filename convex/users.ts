import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get all users (admin only)
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Return users without password field for security
    return users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));
  },
});

// Get pending users count
export const getPendingUsersCount = query({
  handler: async (ctx) => {
    const pendingUsers = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pendingUsers.length;
  },
});

// Approve a user
export const approveUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the user
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update user status to approved
    await ctx.db.patch(args.userId, {
      status: "approved",
    });

    // Schedule email notification (non-blocking)
    ctx.scheduler.runAfter(0, api.emails.sendUserApprovedEmail, {
      name: user.name,
      email: user.email,
    });

    return {
      success: true,
      message: `User ${user.email} has been approved`,
    };
  },
});

// Reject a user
export const rejectUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the user
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update user status to rejected
    await ctx.db.patch(args.userId, {
      status: "rejected",
    });

    return {
      success: true,
      message: `User ${user.email} has been rejected`,
    };
  },
});

// Promote user to admin
export const promoteToAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "admin") {
      throw new Error("User is already an admin");
    }

    await ctx.db.patch(args.userId, {
      role: "admin",
    });

    return {
      success: true,
      message: `User ${user.email} has been promoted to admin`,
    };
  },
});

// Demote admin to user
export const demoteToUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "user") {
      throw new Error("User is already a regular user");
    }

    await ctx.db.patch(args.userId, {
      role: "user",
    });

    return {
      success: true,
      message: `User ${user.email} has been demoted to regular user`,
    };
  },
});

// Delete a user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    await ctx.db.delete(args.userId);

    return {
      success: true,
      message: `User ${user.email} has been deleted`,
    };
  },
});

// Fix existing users to have approved status (run once)
export const migrateExistingUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    let updated = 0;
    for (const user of users) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(user as any).status) {
        await ctx.db.patch(user._id, {
          status: "approved",
        });
        updated++;
      }
    }

    return {
      success: true,
      message: `Migrated ${updated} existing users to approved status`,
    };
  },
});
