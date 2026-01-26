import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ProductType = "starter" | "professional" | "webcare";
type CheckoutMode = "payment" | "subscription";

interface CheckoutRequest {
  productType: ProductType;
  userId?: string;
  customerEmail: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const PRICE_MAP: Record<ProductType, { priceId: string; mode: CheckoutMode; amount: number }> = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    mode: "payment",
    amount: 89900, // $899 in cents
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    mode: "payment",
    amount: 139900, // $1,399 in cents
  },
  webcare: {
    priceId: process.env.STRIPE_PRICE_WEBCARE!,
    mode: "subscription",
    amount: 14900, // $149 in cents (monthly)
  },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const { productType, userId, customerEmail, customerName, successUrl, cancelUrl } = body;

    if (!productType || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: productType, customerEmail" },
        { status: 400 }
      );
    }

    const priceConfig = PRICE_MAP[productType];
    if (!priceConfig) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    if (!priceConfig.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${productType}` },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Create or get Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer: Stripe.Customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          userId: userId ?? "",
        },
      });
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      mode: priceConfig.mode,
      success_url: successUrl ?? `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${siteUrl}/checkout/canceled`,
      metadata: {
        userId: userId ?? "",
        productType,
      },
    };

    // Add subscription-specific options
    if (priceConfig.mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: {
          userId: userId ?? "",
          productType,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create order record in Convex (for one-time payments)
    if (priceConfig.mode === "payment" && (productType === "starter" || productType === "professional")) {
      await convex.mutation(api.stripe.createOrder, {
        userId,
        stripeCustomerId: customer.id,
        stripeSessionId: session.id,
        productType,
        amount: priceConfig.amount,
        customerEmail,
        customerName,
      });
    }

    // Create or update Stripe customer record in Convex
    await convex.mutation(api.stripe.getOrCreateCustomer, {
      userId,
      stripeCustomerId: customer.id,
      email: customerEmail,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
