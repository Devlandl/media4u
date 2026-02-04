"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";

type OrderStatus = "pending" | "paid" | "failed" | "refunded";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const productNames: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useQuery(
    api.stripe.getAllOrders,
    filterStatus !== "all" ? { status: filterStatus } : {}
  );

  const deleteOrder = useMutation(api.stripe.deleteOrder);

  const selected = orders?.find((o: Doc<"orders">) => o._id === selectedId);

  const handleDelete = async () => {
    if (!selected) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this order?\n\nCustomer: ${selected.customerName ?? selected.customerEmail}\nProduct: ${productNames[selected.productType] ?? selected.productType}\nAmount: $${(selected.amount / 100).toFixed(2)}\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteOrder({ id: selected._id });
        setSelectedId(null);
      } catch (error) {
        alert("Failed to delete order. Please try again.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Orders</h1>
        <p className="text-gray-400">View and manage customer orders</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {(["all", "pending", "paid", "failed", "refunded"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {orders?.length ?? 0} Orders
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {orders?.map((order: Doc<"orders">) => (
                <motion.button
                  key={order._id}
                  onClick={() => setSelectedId(order._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === order._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-white text-sm truncate">
                      {order.customerName ?? order.customerEmail}
                    </p>
                    <span className="text-white font-medium text-sm">
                      ${(order.amount / 100).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {productNames[order.productType] ?? order.productType}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </motion.button>
              ))}
              {orders?.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Order
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {productNames[selected.productType] ?? selected.productType}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[selected.status as OrderStatus]}`}
                >
                  {statusLabels[selected.status as OrderStatus]}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Customer Name
                  </p>
                  <p className="text-white">
                    {selected.customerName ?? "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Customer Email
                  </p>
                  <a
                    href={`mailto:${selected.customerEmail}`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {selected.customerEmail}
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Amount
                  </p>
                  <p className="text-2xl font-display font-bold text-white">
                    ${(selected.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Order Date
                  </p>
                  <p className="text-white">
                    {format(
                      new Date(selected.createdAt),
                      "MMMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </div>

              {selected.paidAt && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Paid Date
                  </p>
                  <p className="text-green-400">
                    {format(
                      new Date(selected.paidAt),
                      "MMMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Stripe IDs
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Session: </span>
                    <code className="text-gray-300 text-xs">
                      {selected.stripeSessionId}
                    </code>
                  </div>
                  {selected.stripePaymentIntentId && (
                    <div>
                      <span className="text-gray-500">Payment Intent: </span>
                      <code className="text-gray-300 text-xs">
                        {selected.stripePaymentIntentId}
                      </code>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Customer: </span>
                    <code className="text-gray-300 text-xs">
                      {selected.stripeCustomerId}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`https://dashboard.stripe.com/payments/${selected.stripePaymentIntentId ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View in Stripe Dashboard
                </a>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all border border-red-500/30"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Order
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select an order to view details</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
