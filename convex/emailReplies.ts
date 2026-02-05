import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendEmailReply = action({
  args: {
    to: v.string(),
    subject: v.string(),
    message: v.string(),
    recipientName: v.string(),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Create professional email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 40px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #ff2d92 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                Media4U
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                Professional Websites & Immersive VR Experiences
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                Hi ${args.recipientName},
              </p>
              <div style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">
${args.message}
              </div>
              <p style="margin: 24px 0 0 0; font-size: 15px; color: #374151;">
                Best regards,<br>
                <strong>The Media4U Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937;">
                      <a href="mailto:devland@media4u.fun" style="color: #00d4ff; text-decoration: none;">devland@media4u.fun</a>
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937;">
                      <a href="https://media4u.fun" style="color: #00d4ff; text-decoration: none;">media4u.fun</a>
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 16px auto 0;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://www.instagram.com/media4uvr/" style="color: #00d4ff; text-decoration: none; font-size: 13px;">Instagram</a>
                        </td>
                        <td style="padding: 0 8px; color: #d1d5db;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.youtube.com/channel/UCg-C-WFQDr0OdGVI8YX4V5w" style="color: #00d4ff; text-decoration: none; font-size: 13px;">YouTube</a>
                        </td>
                        <td style="padding: 0 8px; color: #d1d5db;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.tiktok.com/@media4uvr" style="color: #00d4ff; text-decoration: none; font-size: 13px;">TikTok</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
                      © ${new Date().getFullYear()} Media4U. All rights reserved.
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

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: args.to,
        subject: args.subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  },
});
