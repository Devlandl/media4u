"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function validateToken(token: string) {
    try {
      // In a real app, verify with backend
      // For now, just decode the token and load user data
      const decoded = Buffer.from(token, "base64").toString();
      if (decoded.includes(":")) {
        // Token is valid format, load user data
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
        setIsLoading(false);
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setIsLoading(false);
      }
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In production, call your Convex mutation
      // For now, simulate with localStorage
      if (email && password.length >= 6) {
        const token = Buffer.from(`user-${Date.now()}:${Date.now()}`).toString(
          "base64"
        );
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name: email.split("@")[0],
          role: email === "admin@media4u.fun" ? "admin" : "user",
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      if (email && password.length >= 6 && name.length >= 2) {
        const token = Buffer.from(`user-${Date.now()}:${Date.now()}`).toString(
          "base64"
        );
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          role: "user",
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
