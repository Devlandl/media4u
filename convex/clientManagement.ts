import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Shared types for client data
const phoneSchema = v.object({
  number: v.string(),
  label: v.string(),
  isPrimary: v.boolean(),
});

const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zip: v.optional(v.string()),
  country: v.optional(v.string()),
});

// Update client information across all related records
export const updateClientInfo = mutation({
  args: {
    primaryEmail: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      company: v.optional(v.string()),
      website: v.optional(v.string()),
      phones: v.optional(v.array(phoneSchema)),
      address: v.optional(addressSchema),
      tags: v.optional(v.array(v.string())),
      preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
      timezone: v.optional(v.string()),
      referralSource: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { primaryEmail, updates } = args;

    // Find all records for this client across all tables
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), primaryEmail))
      .collect();

    const leads = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("email"), primaryEmail))
      .collect();

    const requests = await ctx.db
      .query("projectRequests")
      .filter((q) => q.eq(q.field("email"), primaryEmail))
      .collect();

    const contacts = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("email"), primaryEmail))
      .collect();

    // Update projects
    for (const project of projects) {
      const updateData: Record<string, unknown> = {
        updatedAt: Date.now(),
      };
      if (updates.name) updateData.name = updates.name;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.phones) updateData.phones = updates.phones;
      if (updates.address) updateData.address = updates.address;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.referralSource) updateData.referralSource = updates.referralSource;
      if (updates.notes) updateData.notes = updates.notes;

      await ctx.db.patch(project._id, updateData);
    }

    // Update leads
    for (const lead of leads) {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.website) updateData.website = updates.website;
      if (updates.phones) updateData.phones = updates.phones;
      if (updates.address) updateData.address = updates.address;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.notes) updateData.notes = updates.notes;

      await ctx.db.patch(lead._id, updateData);
    }

    // Update project requests
    for (const request of requests) {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.company !== undefined) updateData.businessName = updates.company; // Note: requests use "businessName"
      if (updates.website) updateData.website = updates.website;
      if (updates.phones) updateData.phones = updates.phones;
      if (updates.address) updateData.address = updates.address;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.referralSource) updateData.referralSource = updates.referralSource;
      if (updates.notes) updateData.notes = updates.notes;

      await ctx.db.patch(request._id, updateData);
    }

    // Update contact submissions
    for (const contact of contacts) {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.website) updateData.website = updates.website;
      if (updates.phones) updateData.phones = updates.phones;
      if (updates.address) updateData.address = updates.address;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.referralSource) updateData.referralSource = updates.referralSource;
      if (updates.notes) updateData.notes = updates.notes;

      await ctx.db.patch(contact._id, updateData);
    }

    return {
      success: true,
      updated: {
        projects: projects.length,
        leads: leads.length,
        requests: requests.length,
        contacts: contacts.length,
      },
    };
  },
});
