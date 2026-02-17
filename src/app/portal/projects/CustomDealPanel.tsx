"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Loader2,
  RotateCcw,
  ExternalLink,
  CalendarClock,
} from "lucide-react";

interface CustomDealPanelProps {
  project: Doc<"projects">;
}

export function CustomDealPanel({ project }: CustomDealPanelProps) {
  const { user } = useAuth();
  const markInvoicePaid = useMutation(api.projects.markSetupInvoicePaid);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [startingSubscription, setStartingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscription = useQuery(
    api.stripe.getUserSubscription,
    user?.id ? { userId: user.id } : "skip"
  );

  async function handleMarkPaid() {
    setError(null);
    setMarkingPaid(true);
    try {
      await markInvoicePaid({ projectId: project._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMarkingPaid(false);
    }
  }

  async function handleStartSubscription() {
    if (!user?.email) return;
    setStartingSubscription(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-custom-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          customerEmail: user.email,
          customerName: user.name,
          projectId: project._id,
          monthlyAmountDollars: project.monthlyAmount ?? 149,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to start subscription");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStartingSubscription(false);
    }
  }

  const invoiceStatus = project.setupInvoiceStatus ?? "pending";
  const hasActiveSub = subscription?.status === "active";
  const monthlyAmount = project.monthlyAmount ?? 149;

  // Calculate what the 3-month plan looks like (start of next month)
  const now = new Date();
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const threeMonthsLater = new Date(firstOfNextMonth);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  // Get subscription cancel date if active
  const subCancelAt = subscription?.cancelAtPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Setup Fee Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6">
        <div className="flex items-start gap-3 lg:gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-0.5">
              {(project.setupFeeAmount ?? 500) === 0 ? "Setup Fee - Waived" : `Setup Fee - $${project.setupFeeAmount ?? 500}`}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {(project.setupFeeAmount ?? 500) === 0
                ? "Your setup fee has been waived - no payment needed!"
                : "One-time setup fee. You will receive a Stripe invoice by email - pay directly from that email."}
            </p>

            {invoiceStatus === "pending" && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Clock className="w-4 h-4" />
                Invoice coming soon - you will receive an email from Stripe
              </div>
            )}

            {invoiceStatus === "sent" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Receipt className="w-4 h-4" />
                  Invoice sent - check your email to pay
                </div>
                {project.setupInvoiceUrl && (
                  <a
                    href={project.setupInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-yellow-400 hover:bg-amber-500/20 transition-all text-sm font-medium w-full sm:w-auto"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Pay Invoice
                  </a>
                )}
                <button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-800 text-gray-400 hover:text-white text-xs transition-all disabled:opacity-60 w-full sm:w-auto"
                >
                  {markingPaid ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Paid another way?
                </button>
              </div>
            )}

            {invoiceStatus === "needs_verification" && (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <RotateCcw className="w-4 h-4" />
                Payment submitted - verifying (usually within 1 business day)
              </div>
            )}

            {invoiceStatus === "paid" && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                {(project.setupFeeAmount ?? 500) === 0 ? "Setup fee waived - you're all set!" : "Setup fee confirmed - paid"}
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6">
        <div className="flex items-start gap-3 lg:gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-0.5">
              Monthly Plan - ${monthlyAmount}/month
            </h3>

            {hasActiveSub ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-400 mb-3">
                  <CheckCircle className="w-4 h-4" />
                  Plan active
                </div>
                {/* Show billing dates */}
                <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <CalendarClock className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium">3-month plan</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Billed monthly. Your plan automatically ends after 3 months - no surprises.
                  </p>
                  {subscription?.currentPeriodEnd && (
                    <p className="text-gray-400 text-xs mt-1">
                      Next billing: {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                    </p>
                  )}
                  {subCancelAt && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Plan ends: {format(subCancelAt, "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
                <a
                  href="/portal/subscription"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all text-sm font-medium w-full sm:w-fit"
                >
                  <ExternalLink className="w-4 h-4" />
                  Manage Billing
                </a>
              </>
            ) : (
              <>
                {/* Show what they're signing up for */}
                <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                    <CalendarClock className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium">How this works</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">-</span>
                      Setup fee this month covers your first month of work
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-400 mt-0.5">-</span>
                      First ${monthlyAmount} charge: {format(firstOfNextMonth, "MMMM d, yyyy")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-400 mt-0.5">-</span>
                      Then ${monthlyAmount}/month for 2 more months
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-light mt-0.5">-</span>
                      Auto-cancels {format(threeMonthsLater, "MMMM d, yyyy")} - no surprise charges
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">-</span>
                      After that, pay ${monthlyAmount} for any month you need updates
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleStartSubscription}
                  disabled={startingSubscription}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors text-sm disabled:opacity-60 w-full sm:w-auto"
                >
                  {startingSubscription ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {startingSubscription ? "Redirecting..." : `Start ${monthlyAmount}/month Plan`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
