import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all unique clients aggregated from all tables
export const getAllClients = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const leads = await ctx.db.query("leads").collect();
    const requests = await ctx.db.query("projectRequests").collect();
    const contacts = await ctx.db.query("contactSubmissions").collect();

    // Create a map to consolidate clients by email
    const clientsMap = new Map<string, {
      primaryEmail: string;
      name: string;
      emails: Array<{ address: string; label: string; isPrimary: boolean }>;
      phone?: string; // Legacy
      phones?: Array<{ number: string; label: string; isPrimary: boolean }>;
      company?: string;
      website?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
      };
      tags?: string[];
      preferredContact?: "email" | "phone" | "text";
      timezone?: string;
      referralSource?: string;
      notes?: string;
      // Related records
      projectIds: string[];
      leadIds: string[];
      requestIds: string[];
      contactIds: string[];
      // Metadata
      firstSeen: number;
      lastActivity: number;
      totalInteractions: number;
    }>();

    // Helper to add or update client in map
    function addClient(
      email: string,
      name: string,
      emails: Array<{ address: string; label: string; isPrimary: boolean }> | undefined,
      phone: string | undefined,
      phones: Array<{ number: string; label: string; isPrimary: boolean }> | undefined,
      company: string | undefined,
      website: string | undefined,
      address: { street?: string; city?: string; state?: string; zip?: string; country?: string } | undefined,
      tags: string[] | undefined,
      preferredContact: "email" | "phone" | "text" | undefined,
      timezone: string | undefined,
      referralSource: string | undefined,
      notes: string | undefined,
      createdAt: number,
      recordId: string,
      type: "project" | "lead" | "request" | "contact"
    ) {
      // Use primary email or first email from array, fallback to single email
      const primaryEmail = emails?.find(e => e.isPrimary)?.address || emails?.[0]?.address || email;

      if (!clientsMap.has(primaryEmail)) {
        clientsMap.set(primaryEmail, {
          primaryEmail,
          name,
          emails: emails || [{ address: email, label: "Primary", isPrimary: true }],
          phone,
          phones,
          company,
          website,
          address,
          tags,
          preferredContact,
          timezone,
          referralSource,
          notes,
          projectIds: [],
          leadIds: [],
          requestIds: [],
          contactIds: [],
          firstSeen: createdAt,
          lastActivity: createdAt,
          totalInteractions: 0,
        });
      }

      const client = clientsMap.get(primaryEmail)!;

      // Update fields if they're empty (prefer filled data)
      if (!client.phone && phone) client.phone = phone;
      if (!client.company && company) client.company = company;
      if (!client.website && website) client.website = website;
      if (!client.address && address) client.address = address;
      if (!client.tags && tags) client.tags = tags;
      if (!client.preferredContact && preferredContact) client.preferredContact = preferredContact;
      if (!client.timezone && timezone) client.timezone = timezone;
      if (!client.referralSource && referralSource) client.referralSource = referralSource;
      if (!client.notes && notes) client.notes = notes;

      // Merge emails if new ones exist
      if (emails && emails.length > 0) {
        const existingAddresses = new Set(client.emails.map(e => e.address));
        for (const newEmail of emails) {
          if (!existingAddresses.has(newEmail.address)) {
            client.emails.push(newEmail);
          }
        }
      }

      // Merge phones if new ones exist
      if (phones && phones.length > 0) {
        if (!client.phones) client.phones = [];
        const existingNumbers = new Set(client.phones.map(p => p.number));
        for (const newPhone of phones) {
          if (!existingNumbers.has(newPhone.number)) {
            client.phones.push(newPhone);
          }
        }
      }

      // Add record ID to appropriate list
      if (type === "project") client.projectIds.push(recordId);
      if (type === "lead") client.leadIds.push(recordId);
      if (type === "request") client.requestIds.push(recordId);
      if (type === "contact") client.contactIds.push(recordId);

      // Update activity tracking
      if (createdAt < client.firstSeen) client.firstSeen = createdAt;
      if (createdAt > client.lastActivity) client.lastActivity = createdAt;
      client.totalInteractions++;
    }

    // Add all projects
    for (const project of projects) {
      addClient(
        project.email,
        project.name,
        project.emails,
        project.phone,
        project.phones,
        project.company,
        project.socialLinks?.website,
        project.address,
        project.tags,
        project.preferredContact,
        project.timezone,
        project.referralSource,
        project.notes,
        project.createdAt,
        project._id,
        "project"
      );
    }

    // Add all leads
    for (const lead of leads) {
      addClient(
        lead.email,
        lead.name,
        lead.emails,
        lead.phone,
        lead.phones,
        lead.company,
        lead.website,
        lead.address,
        lead.tags,
        lead.preferredContact,
        lead.timezone,
        lead.source, // Use source as referralSource
        lead.notes,
        lead.createdAt,
        lead._id,
        "lead"
      );
    }

    // Add all requests
    for (const request of requests) {
      addClient(
        request.email,
        request.name,
        request.emails,
        undefined, // legacy phone
        request.phones,
        request.businessName,
        request.website,
        request.address,
        request.tags,
        request.preferredContact,
        request.timezone,
        request.referralSource,
        request.notes,
        request.createdAt,
        request._id,
        "request"
      );
    }

    // Add all contacts
    for (const contact of contacts) {
      addClient(
        contact.email,
        contact.name,
        contact.emails,
        undefined, // legacy phone
        contact.phones,
        contact.company,
        contact.website,
        contact.address,
        contact.tags,
        contact.preferredContact,
        contact.timezone,
        contact.referralSource,
        contact.notes,
        contact.createdAt,
        contact._id,
        "contact"
      );
    }

    // Convert map to array and sort by last activity
    return Array.from(clientsMap.values()).sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// Get client details with all related records
export const getClientDetails = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const leads = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const requests = await ctx.db
      .query("projectRequests")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const contacts = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    return {
      projects,
      leads,
      requests,
      contacts,
    };
  },
});
