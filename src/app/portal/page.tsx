"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

export default function PortalPage(): ReactElement {
  const { user } = useAuth();

  const orders = useQuery(
    api.stripe.getUserOrders,
    user?.id ? { userId: user.id } : "skip"
  );

  const subscription = useQuery(
    api.stripe.getUserSubscription,
    user?.id ? { userId: user.id } : "skip"
  );

  const recentOrders = orders?.slice(0, 3) ?? [];
  const paidOrdersCount = orders?.filter((o: Doc<"orders">) => o.status === "paid").length ?? 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome back, <span className="text-gradient-cyber">{user?.name}</span>
        </h1>
        <p className="text-gray-400">
          Manage your orders and subscription from your client portal.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Total Orders</div>
          <div className="text-3xl font-display font-bold text-white">
            {paidOrdersCount}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Subscription Status</div>
          <div className="text-3xl font-display font-bold">
            {subscription?.status === "active" ? (
              <span className="text-green-400">Active</span>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Account Email</div>
          <div className="text-lg font-medium text-white truncate">
            {user?.email}
          </div>
        </motion.div>
      </div>

      {/* Active Subscription */}
      {subscription?.status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-elevated rounded-2xl p-6 mb-8 border border-green-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-display font-semibold mb-1">
                Web Care Subscription
              </h2>
              <p className="text-gray-400 text-sm">
                Next billing date:{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
              </p>
            </div>
            <Link
              href="/portal/subscription"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Recent Orders</h2>
          {orders && orders.length > 3 && (
            <Link
              href="/portal/orders"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No orders yet</p>
            <Link
              href="/start-project"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Browse our packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: Doc<"orders">) => (
              <div key={order._id} className="glass-elevated rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-medium text-white">
                      {PRODUCT_NAMES[order.productType] ?? order.productType}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(order.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${(order.amount / 100).toFixed(2)}
                    </div>
                    <div
                      className={`text-sm capitalize ${
                        order.status === "paid"
                          ? "text-green-400"
                          : order.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
