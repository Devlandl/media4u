"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Admin users now use the regular login page
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-brand-light animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
