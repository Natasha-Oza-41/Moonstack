"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useMoonstackStore } from "@/store/moonstack-store";

export function SupabaseSync() {
  const snapshotKey = useMoonstackStore((state) => JSON.stringify({
    tasks: state.tasks,
    roadmaps: state.roadmaps,
    dsaProblems: state.dsaProblems,
    projects: state.projects,
    notes: state.notes,
    healthLogs: state.healthLogs,
    settings: state.settings,
    xp: state.xp,
    streak: state.streak,
  }));
  const exportSnapshot = useMoonstackStore((state) => state.exportSnapshot);
  const importSnapshot = useMoonstackStore((state) => state.importSnapshot);
  const synced = useRef(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      synced.current = false;
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || synced.current) return;
    synced.current = true;
    supabase.from("moonstack_state").select("state").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.state) importSnapshot(data.state);
    });
  }, [importSnapshot, user]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || !synced.current) return;
    const timer = window.setTimeout(() => {
      supabase.from("moonstack_state").upsert({
        user_id: user.id,
        state: exportSnapshot(),
        updated_at: new Date().toISOString(),
      }).then(() => undefined);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [exportSnapshot, snapshotKey, user]);

  return null;
}
