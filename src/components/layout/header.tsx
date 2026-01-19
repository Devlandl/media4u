"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/vr", label: "VR/Multiverse" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-void-950/60 backdrop-blur-md">

      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative group">
          <span className="font-display text-2xl font-bold tracking-tight">
            Media<span className="text-gradient-cyber">4U</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-white ${
                pathname === link.href
                  ? "text-cyan-400"
                  : "text-gray-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow duration-300"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-5">
            <span
              className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-elevated mt-2 mx-4 rounded-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium py-2 ${
                      pathname === link.href
                        ? "text-cyan-400"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-block mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
