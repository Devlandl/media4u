"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Globe, LogOut } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserInfo {
  name?: string;
  email?: string;
}

interface PortalMobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  navItems: NavItem[];
  pathname: string;
  user: UserInfo | null;
  onSignOut: () => void;
}

export function PortalMobileNav({
  isOpen,
  onToggle,
  onClose,
  navItems,
  pathname,
  user,
  onSignOut,
}: PortalMobileNavProps) {
  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={32}
              height={32}
              priority
              className="w-8 h-8"
            />
          </Link>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Portal
          </span>
        </div>

        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-out Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 p-6 overflow-y-auto"
            >
              {/* Logo and Portal Label */}
              <div className="mb-6">
                <Link
                  href="/"
                  className="flex items-center justify-center mb-3"
                  onClick={onClose}
                >
                  <Image
                    src="/media4u-logo.png"
                    alt="Media4U Logo"
                    width={48}
                    height={48}
                    priority
                    className="w-12 h-12"
                  />
                </Link>
                <p className="text-xs text-gray-500 uppercase tracking-wider text-center">
                  Portal
                </p>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Links */}
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Back to Site</span>
                </Link>

                <button
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/50 text-red-400 hover:bg-red-950 transition-all duration-200 border border-red-900/50 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
