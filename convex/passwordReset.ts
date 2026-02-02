import { mutation, action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  emailBaseTemplate,
  emailHeading,
  emailParagraph,
  emailButton,
  emailDivider,
} from "./lib/emailTemplates";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@media4u.fun";
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Generate a random token
function generateResetToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Internal query to find user by email
export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Query the Better Auth users table (account table)
    const user = await ctx.db
      .query("account")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    return user ? { exists: true, id: user._id } : { exists: false };
  },
});

// Internal mutation to create reset token
export const createResetToken = internalMutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, token, expiresAt }) => {
    await ctx.db.insert("passwordResetTokens", {
      email,
      token,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    });
  },
});

// Request password reset (creates token and sends email)
export const requestPasswordReset = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    // Check if user exists
    const userCheck = await ctx.runQuery(internal.passwordReset.findUserByEmail, { email });

    if (!userCheck.exists) {
      // Don't reveal if email exists or not (security best practice)
      return { success: true };
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour from now

    // Store token in database
    await ctx.runMutation(internal.passwordReset.createResetToken, {
      email,
      token,
      expiresAt,
    });

    // Send reset email
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const resetUrl = `${SITE_URL}/reset-password?token=${token}`;

    const html = emailBaseTemplate(`
      ${emailHeading("Reset Your Password")}
      ${emailParagraph("You requested to reset your password for your Media4U account. Click the button below to create a new password.")}
      ${emailDivider()}
      ${emailButton("Reset Password", resetUrl)}
      ${emailDivider()}
      ${emailParagraph("This link will expire in 1 hour.")}
      ${emailParagraph("If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.")}
      ${emailParagraph("<strong>Best regards,</strong><br>The Media4U Team")}
    `);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: "Reset Your Password - Media4U",
          html: html,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send reset email:", response.statusText);
        return { success: false, error: "Failed to send email" };
      }

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Verify reset token
export const verifyResetToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!resetToken) {
      return { valid: false, error: "Invalid reset token" };
    }

    if (resetToken.used) {
      return { valid: false, error: "This reset link has already been used" };
    }

    if (Date.now() > resetToken.expiresAt) {
      return { valid: false, error: "This reset link has expired" };
    }

    return { valid: true, email: resetToken.email };
  },
});

// Update password directly in the database
export const updatePasswordDirect = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { email, passwordHash }) => {
    // Find user account
    const account = await ctx.db
      .query("account")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!account) {
      throw new Error("User not found");
    }

    // Update password hash
    await ctx.db.patch(account._id, {
      password: passwordHash,
    });
  },
});

// Mark token as used
export const markTokenAsUsed = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (resetToken) {
      await ctx.db.patch(resetToken._id, { used: true });
    }
  },
});

// Reset password (just returns token info, actual reset happens via API route)
export const resetPassword = action({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { token, newPassword }) => {
    // Call our API endpoint to handle the password reset
    const siteUrl = SITE_URL;

    try {
      const response = await fetch(`${siteUrl}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || "Failed to reset password" };
      }

      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "Failed to reset password" };
    }
  },
});
