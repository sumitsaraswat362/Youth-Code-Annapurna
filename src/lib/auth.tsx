"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "director" | "wholesaler" | null;

interface AuthUser {
  name: string;
  role: UserRole;
  password?: string;
  location?: string;
  city?: string;
  address?: string;
  coords?: { lat: number; lng: number };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (name: string, role: UserRole, password?: string, location?: string, city?: string, address?: string, coords?: { lat: number; lng: number }) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("annapurna_active_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (name: string, role: UserRole, password?: string, location?: string, city?: string, address?: string, coords?: { lat: number; lng: number }) => {
    // Basic persistent user registry in localStorage
    const savedProfilesRaw = localStorage.getItem("annapurna_profiles");
    const profiles: AuthUser[] = savedProfilesRaw ? JSON.parse(savedProfilesRaw) : [];
    
    const existingUser = profiles.find(p => p.name === name && p.role === role);

    let finalUser: AuthUser;

    if (existingUser) {
      if (existingUser.password !== password) {
        return "Incorrect password for this user.";
      }
      // Update location info on every login if provided
      if (location) existingUser.location = location;
      if (city) existingUser.city = city;
      if (address) existingUser.address = address;
      if (coords) existingUser.coords = coords;
      
      finalUser = existingUser;
      // Save the updated profiles to localStorage
      localStorage.setItem("annapurna_profiles", JSON.stringify(profiles));
    } else {
      // Register new user
      finalUser = { name, role, password, location, city, address, coords };
      profiles.push(finalUser);
      localStorage.setItem("annapurna_profiles", JSON.stringify(profiles));
    }

    setUser(finalUser);
    localStorage.setItem("annapurna_active_user", JSON.stringify(finalUser));
    
    if (role === "director") router.push("/fleet");
    if (role === "wholesaler") router.push("/wholesaler");
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("annapurna_active_user");
    router.push("/");
  };

  // Prevent hydration mismatch by returning null until mounted
  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
