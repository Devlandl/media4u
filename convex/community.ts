import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAdmin } from "./auth";

// Generate a random token for invite links
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================
// ADMIN: Invite Management
// ============================================

// Get all invites (for admin)
export const getAllInvites = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("communityInvites")
      .order("desc")
      .collect();
  },
});

// Create and send an invite
export const createInvite = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if email already has a pending invite
    const existing = await ctx.db
      .query("communityInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (existing && (existing.status === "pending" || existing.status === "approved")) {
      throw new Error("This email already has an active invite or is already a member");
    }

    const token = generateToken();

    const inviteId = await ctx.db.insert("communityInvites", {
      email: args.email.toLowerCase().trim(),
      name: args.name,
      token,
      status: "pending",
      message: args.message,
      sentAt: Date.now(),
    });

    return { inviteId, token };
  },
});

// Revoke an invite
export const revokeInvite = mutation({
  args: {
    id: v.id("communityInvites"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, {
      status: "revoked",
    });
  },
});

// Resend invite (generates new token)
export const resendInvite = mutation({
  args: {
    id: v.id("communityInvites"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const invite = await ctx.db.get(args.id);
    if (!invite) throw new Error("Invite not found");

    const newToken = generateToken();

    await ctx.db.patch(args.id, {
      token: newToken,
      status: "pending",
      sentAt: Date.now(),
    });

    return { token: newToken, email: invite.email, name: invite.name };
  },
});

// ============================================
// PUBLIC: Submission Flow
// ============================================

// Validate invite token (public - for submission page)
export const validateInviteToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("communityInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      return { valid: false, error: "Invalid invite link" };
    }

    if (invite.status === "revoked") {
      return { valid: false, error: "This invite has been revoked" };
    }

    if (invite.status === "approved") {
      return { valid: false, error: "You have already been approved" };
    }

    if (invite.status === "submitted") {
      return { valid: false, error: "Your submission is pending review" };
    }

    return {
      valid: true,
      invite: {
        name: invite.name,
        email: invite.email,
      },
    };
  },
});

// Submit community entry (public - via invite token)
export const submitCommunityEntry = mutation({
  args: {
    token: v.string(),
    worldName: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    multiverseUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Find the invite by token
    const invite = await ctx.db
      .query("communityInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new Error("Invalid invite token");
    }

    if (invite.status !== "pending") {
      throw new Error("This invite is no longer valid");
    }

    // Create the community member entry (not approved yet)
    const memberId = await ctx.db.insert("communityMembers", {
      inviteId: invite._id,
      name: invite.name,
      worldName: args.worldName,
      description: args.description,
      images: args.images,
      multiverseUrl: args.multiverseUrl,
      websiteUrl: args.websiteUrl,
      socialLinks: args.socialLinks,
      featured: false,
      approved: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: "submitted",
    });

    return memberId;
  },
});

// ============================================
// ADMIN: Approval & Management
// ============================================

// Get all submissions (pending approval)
export const getPendingSubmissions = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_approved", (q) => q.eq("approved", false))
      .collect();

    // Get invite info for each member
    const withInvites = await Promise.all(
      members.map(async (member) => {
        const invite = await ctx.db.get(member.inviteId);
        return {
          ...member,
          inviteEmail: invite?.email,
          inviteName: invite?.name,
        };
      })
    );

    return withInvites;
  },
});

// Approve a submission
export const approveSubmission = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    // Approve the member
    await ctx.db.patch(args.id, {
      approved: true,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update invite status
    await ctx.db.patch(member.inviteId, {
      status: "approved",
    });

    return args.id;
  },
});

// Reject a submission (delete it)
export const rejectSubmission = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    // Delete the member entry
    await ctx.db.delete(args.id);

    // Update invite status back to pending so they can resubmit
    await ctx.db.patch(member.inviteId, {
      status: "pending",
    });
  },
});

// Toggle featured status
export const toggleFeatured = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    await ctx.db.patch(args.id, {
      featured: !member.featured,
      updatedAt: Date.now(),
    });
  },
});

// Delete a community member
export const deleteMember = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});

// ============================================
// PUBLIC: Display
// ============================================

// Get all approved community members (for public page)
export const getApprovedMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();

    // Sort: featured first, then by approval date
    return members.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.approvedAt || 0) - (a.approvedAt || 0);
    });
  },
});

// Get all community members (for admin)
export const getAllMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .order("desc")
      .collect();

    // Get invite info for each
    const withInvites = await Promise.all(
      members.map(async (member) => {
        const invite = await ctx.db.get(member.inviteId);
        return {
          ...member,
          inviteEmail: invite?.email,
        };
      })
    );

    return withInvites;
  },
});

// ============================================
// EMAIL: Send Invite
// ============================================

export const sendInviteEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    token: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const submitUrl = `https://media4u.fun/community/submit?token=${args.token}`;

    const personalMessage = args.message
      ? `<p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; font-style: italic; padding: 16px; background: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px;">"${args.message}"</p>`
      : "";

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to the VR Multiverse Community</title>
</head>
<body style="margin: 0; padding: 0; background-color: #03030a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #03030a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0a0a12; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #ff2d92 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Media4U
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                VR Multiverse Community
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                You're Invited, ${args.name}!
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                We'd love to feature your VR world in the Media4U Multiverse Community - a curated showcase of trusted creators and their virtual experiences.
              </p>

              ${personalMessage}

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                This is an invite-only community of people building meaningful spaces in the Multiverse. We think your work belongs here.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);">
                    <a href="${submitUrl}" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Submit Your World
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #94a3b8;">
                This invite link is unique to you. Simply click the button above to share your VR world with our community.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="mailto:devland@media4u.fun" style="color: #00d4ff; text-decoration: none;">devland@media4u.fun</a>
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="https://media4u.fun" style="color: #00d4ff; text-decoration: none;">media4u.fun</a>
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                      &copy; ${new Date().getFullYear()} Media4U. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: `You're Invited to the VR Multiverse Community, ${args.name}!`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send invite email:", error);
        return { success: false, error: response.statusText };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending invite email:", error);
      return { success: false, error: String(error) };
    }
  },
});
