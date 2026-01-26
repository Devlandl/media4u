"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";

interface AdminContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const sessionUser = session?.user as { id: string } | undefined;

  // Check admin status using user ID from session
  const isAdminResult = useQuery(
    api.auth.checkAdminByUserId,
    sessionUser?.id ? { userId: sessionUser.id } : "skip"
  );

  const isAuthenticated = !!session;
  const isAdmin = isAdminResult === true;
  const isLoading = sessionPending || isAdminResult === undefined;

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
