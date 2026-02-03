import { mutation } from "./_generated/server";
import { v } from "convex/values";

// CLI Admin Key from environment
const CLI_ADMIN_KEY = process.env.CLI_ADMIN_KEY || "dev-key-12345";

// CLI-specific mutations that use an admin key instead of session auth
// This allows Claude to post content directly from the terminal

export const createBlogPostCLI = mutation({
  args: {
    adminKey: v.string(),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    date: v.string(),
    readTime: v.string(),
    gradient: v.string(),
    featured: v.boolean(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify admin key
    if (args.adminKey !== CLI_ADMIN_KEY) {
      throw new Error("Invalid admin key");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminKey, ...postData } = args;

    const id = await ctx.db.insert("blogPosts", {
      ...postData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const createNewsletterCLI = mutation({
  args: {
    adminKey: v.string(),
    subject: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin key
    if (args.adminKey !== CLI_ADMIN_KEY) {
      throw new Error("Invalid admin key");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminKey, ...newsletterData } = args;

    const now = Date.now();
    const id = await ctx.db.insert("newsletters", {
      ...newsletterData,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});
