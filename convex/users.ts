import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";

// Update user's display name
export const updateUserName = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    // Verify user is updating their own name
    if (user.userId !== args.userId) {
      throw new Error("Permission denied");
    }

    // Update the user's name in the userRoles table
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (userRole) {
      await ctx.db.patch(userRole._id, {
        name: args.name,
      });
    }

    return { success: true };
  },
});
