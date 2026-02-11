import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(secretKey, { apiVersion: "2025-12-15.clover" });
}

function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  return new ConvexHttpClient(convexUrl);
}

// Get the Unix timestamp for the first day of next month (UTC midnight)
function getFirstDayOfNextMonth(): number {
  const now = new Date();
  const firstOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return Math.floor(firstOfNextMonth.getTime() / 1000);
}

// Add 3 months to a Unix timestamp
function addThreeMonths(unixTimestamp: number): number {
  const date = new Date(unixTimestamp * 1000);
  date.setUTCMonth(date.getUTCMonth() + 3);
  return Math.floor(date.getTime() / 1000);
}

interface CustomSubRequest {
  userId?: string;
  customerEmail: string;
  customerName?: string;
  projectId?: string;
  monthlyAmountDollars?: number; // custom amount, defaults to 149
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CustomSubRequest;
    const { userId, customerEmail, customerName, projectId, monthlyAmountDollars = 149 } = body;

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing customerEmail" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const convex = getConvexClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer: Stripe.Customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName ?? undefined,
        metadata: { userId: userId ?? "" },
      });
    }

    // Save customer record in Convex
    await convex.mutation(api.stripe.getOrCreateCustomer, {
      userId,
      stripeCustomerId: customer.id,
      email: customerEmail,
    });

    // Calculate timing:
    // - trial_end = first day of next month (first charge happens then)
    // - cancel_at = 3 months after trial_end (auto-cancels after 3 billing cycles)
    const trialEnd = getFirstDayOfNextMonth();
    const cancelAt = addThreeMonths(trialEnd);

    // Get the webcare price ID (reuse the existing monthly price)
    const priceId = process.env.STRIPE_PRICE_WEBCARE;
    if (!priceId) {
      return NextResponse.json({ error: "STRIPE_PRICE_WEBCARE not configured" }, { status: 500 });
    }

    // Create checkout session with delayed start.
    // cancel_at is NOT supported in subscription_data here, so we pass it
    // via metadata and the webhook applies it after the subscription is created.
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_end: trialEnd,
        metadata: {
          userId: userId ?? "",
          projectId: projectId ?? "",
          customDeal: "true",
          monthlyAmount: String(monthlyAmountDollars),
          cancelAt: String(cancelAt), // webhook will apply this
        },
      },
      success_url: `${siteUrl}/portal?sub=started`,
      cancel_url: `${siteUrl}/portal/projects`,
      metadata: {
        userId: userId ?? "",
        projectId: projectId ?? "",
      },
    });

    return NextResponse.json({
      url: session.url,
      trialEnd,
      cancelAt,
    });
  } catch (err) {
    console.error("Create custom subscription error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}
