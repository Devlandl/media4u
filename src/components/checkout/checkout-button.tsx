"use client";

import { type ReactElement, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";

type ProductType = "starter" | "professional" | "webcare";

interface CheckoutButtonProps {
  productType: ProductType;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CheckoutButton({
  productType,
  label,
  variant = "primary",
  size = "md",
  className,
}: CheckoutButtonProps): ReactElement {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabels: Record<ProductType, string> = {
    starter: "Get Started - $899",
    professional: "Get Started - $1,399",
    webcare: "Subscribe - $149/mo",
  };

  const handleClick = async (): Promise<void> => {
    setError(null);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType,
          userId: user?.id,
          customerEmail: user?.email,
          customerName: user?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={loading || isLoading}
      >
        {loading ? "Loading..." : label ?? defaultLabels[productType]}
      </Button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
