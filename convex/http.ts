import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const http = httpRouter();

// Register Better Auth routes with CORS enabled for client-side access
authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [siteUrl, "http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Stripe webhook endpoint
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe environment variables");
      return new Response("Server configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-12-15.clover" });
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.mode === "payment") {
            // One-time payment completed
            await ctx.runMutation(internal.stripe.updateOrderStatus, {
              stripeSessionId: session.id,
              status: "paid",
              stripePaymentIntentId: session.payment_intent as string,
              paidAt: Date.now(),
            });
          } else if (session.mode === "subscription") {
            // Subscription checkout completed - subscription created event will handle the details
            console.log("Subscription checkout completed:", session.id);
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionDetails = invoice.parent?.subscription_details;
          const subscriptionId = subscriptionDetails?.subscription;

          if (subscriptionId && invoice.billing_reason === "subscription_create") {
            // New subscription - create record using invoice period
            const subId = typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
            // Get price ID from line item pricing
            const lineItem = invoice.lines.data[0];
            const priceId = lineItem?.pricing?.price_details?.price;
            const priceIdStr = typeof priceId === "string" ? priceId : priceId?.id ?? "";

            await ctx.runMutation(internal.stripe.createSubscription, {
              userId: subscriptionDetails?.metadata?.userId || undefined,
              stripeCustomerId: invoice.customer as string,
              stripeSubscriptionId: subId,
              stripePriceId: priceIdStr,
              status: "active",
              currentPeriodStart: invoice.period_start * 1000,
              currentPeriodEnd: invoice.period_end * 1000,
              cancelAtPeriodEnd: false,
              customerEmail: invoice.customer_email ?? "",
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          // Use start_date and created as fallbacks for period tracking
          const periodStart = subscription.start_date ?? subscription.created;
          // Estimate period end as 30 days after start for monthly subscriptions
          const periodEnd = periodStart + (30 * 24 * 60 * 60);
          await ctx.runMutation(internal.stripe.updateSubscription, {
            stripeSubscriptionId: subscription.id,
            status: subscription.status as "active" | "past_due" | "canceled" | "unpaid",
            currentPeriodStart: periodStart * 1000,
            currentPeriodEnd: periodEnd * 1000,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await ctx.runMutation(internal.stripe.updateSubscription, {
            stripeSubscriptionId: subscription.id,
            status: "canceled",
          });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error processing webhook:", err);
      return new Response("Webhook processing error", { status: 500 });
    }
  }),
});

export default http;
