import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

type EmailType = {
  address: string;
  label: string;
  isPrimary: boolean;
};

type RecordWithEmails = {
  emails?: EmailType[];
  [key: string]: unknown;
};

// Add an email to a record (projects, contacts, leads, etc.)
export const addEmail = mutation({
  args: {
    table: v.union(
      v.literal("projects"),
      v.literal("contactSubmissions"),
      v.literal("projectRequests"),
      v.literal("leads")
    ),
    recordId: v.string(),
    email: v.object({
      address: v.string(),
      label: v.string(),
      isPrimary: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId as Id<typeof args.table>) as RecordWithEmails | null;
    if (!record) throw new Error("Record not found");

    const currentEmails = record.emails || [];

    // If this is set as primary, unset any existing primary
    let updatedEmails = currentEmails;
    if (args.email.isPrimary) {
      updatedEmails = currentEmails.map((e) => ({
        ...e,
        isPrimary: false,
      }));
    }

    // Add the new email
    updatedEmails.push(args.email);

    await ctx.db.patch(args.recordId as Id<typeof args.table>, {
      emails: updatedEmails,
    });

    return { success: true };
  },
});

// Update an existing email
export const updateEmail = mutation({
  args: {
    table: v.union(
      v.literal("projects"),
      v.literal("contactSubmissions"),
      v.literal("projectRequests"),
      v.literal("leads")
    ),
    recordId: v.string(),
    emailIndex: v.number(),
    email: v.object({
      address: v.string(),
      label: v.string(),
      isPrimary: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId as Id<typeof args.table>) as RecordWithEmails | null;
    if (!record) throw new Error("Record not found");

    let emails = record.emails || [];

    // If this is set as primary, unset any existing primary
    if (args.email.isPrimary) {
      emails = emails.map((e, index) => ({
        ...e,
        isPrimary: index === args.emailIndex, // Only the updated one is primary
      }));
    }

    // Update the specific email
    emails[args.emailIndex] = args.email;

    await ctx.db.patch(args.recordId as Id<typeof args.table>, {
      emails,
    });

    return { success: true };
  },
});

// Remove an email
export const removeEmail = mutation({
  args: {
    table: v.union(
      v.literal("projects"),
      v.literal("contactSubmissions"),
      v.literal("projectRequests"),
      v.literal("leads")
    ),
    recordId: v.string(),
    emailIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId as Id<typeof args.table>) as RecordWithEmails | null;
    if (!record) throw new Error("Record not found");

    const emails = record.emails || [];
    const removedEmail = emails[args.emailIndex];

    // Remove the email
    const updatedEmails = emails.filter((_, index) => index !== args.emailIndex);

    // If we removed the primary email and there are still emails left, make the first one primary
    if (removedEmail?.isPrimary && updatedEmails.length > 0) {
      updatedEmails[0].isPrimary = true;
    }

    await ctx.db.patch(args.recordId as Id<typeof args.table>, {
      emails: updatedEmails,
    });

    return { success: true };
  },
});

// Set an email as primary
export const setPrimaryEmail = mutation({
  args: {
    table: v.union(
      v.literal("projects"),
      v.literal("contactSubmissions"),
      v.literal("projectRequests"),
      v.literal("leads")
    ),
    recordId: v.string(),
    emailIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId as Id<typeof args.table>) as RecordWithEmails | null;
    if (!record) throw new Error("Record not found");

    const emails = record.emails || [];

    // Set all to non-primary except the selected one
    const updatedEmails = emails.map((e, index) => ({
      ...e,
      isPrimary: index === args.emailIndex,
    }));

    await ctx.db.patch(args.recordId as Id<typeof args.table>, {
      emails: updatedEmails,
    });

    return { success: true };
  },
});
