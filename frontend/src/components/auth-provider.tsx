"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ProfileRole = "employee" | "admin_hr";

type Profile = {
  id: string;
  role: ProfileRole | null;
  full_name: string | null;
  email: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!active) return;

      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      await fetchProfile(initialSession?.user ?? null);
      setLoading(false);
    };

    void initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await fetchProfile(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return false;
    }

    if (data.user) {
      await fetchProfile(data.user);
    }

    setLoading(false);
    return true;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return false;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "employee",
      });
      await fetchProfile(data.user);
    }

    setLoading(false);
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      authError,
      signIn,
      signUp,
      signOut,
    }),
    [session, user, profile, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
