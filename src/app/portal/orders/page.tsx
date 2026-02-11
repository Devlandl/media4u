"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  refunded: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
};

export default function PortalOrdersPage(): ReactElement {
  const { user } = useAuth();

  const orders = useQuery(
    api.stripe.getUserOrders,
    user?.id ? { userId: user.id } : "skip"
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          Order <span className="text-white">History</span>
        </h1>
        <p className="text-gray-400">
          View all your past purchases and order details.
        </p>
      </motion.div>

      {/* Orders List */}
      {!orders ? (
        <div className="text-center text-gray-400 py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 lg:p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            No orders yet
          </h3>
          <p className="text-gray-400 mb-6">
            When you purchase a package, your orders will appear here.
          </p>
          <Link
            href="/portal/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-all"
          >
            Start a Project
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Doc<"orders">, index: number) => (
            <Link href={`/portal/orders/${order._id}`} key={order._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 cursor-pointer hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white text-lg group-hover:text-white transition-colors">
                        {PRODUCT_NAMES[order.productType] ?? order.productType}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                      <span>
                        Order Date:{" "}
                        {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {order.paidAt && (
                        <span>
                          Paid:{" "}
                          {format(new Date(order.paidAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl lg:text-2xl font-semibold text-white">
                      ${(order.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {order.customerEmail}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
