import { mutation, query } from "./_generated/server";
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

// Get client data for the current authenticated user
export const getMyClientData = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const email = identity.email;
    if (!email) {
      return null;
    }

    // Try to find client data from any of the tables
    // Check projects first
    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (project) {
      return {
        primaryEmail: email,
        name: project.name,
        company: project.company,
        website: undefined,
        emails: [],
        phones: project.phones,
        address: project.address,
        tags: project.tags,
        preferredContact: project.preferredContact,
        timezone: project.timezone,
        referralSource: project.referralSource,
        notes: project.notes,
      };
    }

    // Check leads
    const lead = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (lead) {
      return {
        primaryEmail: email,
        name: lead.name,
        company: lead.company,
        website: lead.website,
        emails: [],
        phones: lead.phones,
        address: lead.address,
        tags: lead.tags,
        preferredContact: lead.preferredContact,
        timezone: lead.timezone,
        referralSource: undefined,
        notes: lead.notes,
      };
    }

    // Check project requests
    const request = await ctx.db
      .query("projectRequests")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (request) {
      return {
        primaryEmail: email,
        name: request.name,
        company: request.businessName,
        website: request.website,
        emails: [],
        phones: request.phones,
        address: request.address,
        tags: request.tags,
        preferredContact: request.preferredContact,
        timezone: request.timezone,
        referralSource: request.referralSource,
        notes: request.notes,
      };
    }

    // Check contact submissions
    const contact = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (contact) {
      return {
        primaryEmail: email,
        name: contact.name,
        company: contact.company,
        website: contact.website,
        emails: [],
        phones: contact.phones,
        address: contact.address,
        tags: contact.tags,
        preferredContact: contact.preferredContact,
        timezone: contact.timezone,
        referralSource: contact.referralSource,
        notes: contact.notes,
      };
    }

    // No client data found
    return null;
  },
});

// Update current user's client information (client-safe version)
export const updateMyClientInfo = mutation({
  args: {
    updates: v.object({
      name: v.optional(v.string()),
      company: v.optional(v.string()),
      website: v.optional(v.string()),
      phones: v.optional(v.array(phoneSchema)),
      address: v.optional(addressSchema),
      preferredContact: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("text"))),
      timezone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("No email found");
    }

    // Use the existing updateClientInfo mutation but with the authenticated user's email
    // This ensures they can only update their own records
    const { updates } = args;

    // Find all records for this user across all tables
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), email))
      .collect();

    const leads = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("email"), email))
      .collect();

    const requests = await ctx.db
      .query("projectRequests")
      .filter((q) => q.eq(q.field("email"), email))
      .collect();

    const contacts = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("email"), email))
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
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;

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
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;

      await ctx.db.patch(lead._id, updateData);
    }

    // Update project requests
    for (const request of requests) {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.company !== undefined) updateData.businessName = updates.company;
      if (updates.website) updateData.website = updates.website;
      if (updates.phones) updateData.phones = updates.phones;
      if (updates.address) updateData.address = updates.address;
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;

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
      if (updates.preferredContact) updateData.preferredContact = updates.preferredContact;
      if (updates.timezone) updateData.timezone = updates.timezone;

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
