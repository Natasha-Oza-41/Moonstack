"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { ViewSkeleton } from "@/components/ui/primitives";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/auth");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
      if (!data.session) router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setChecking(false);
      if (!nextSession) router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    });

    return () => data.subscription.unsubscribe();
  }, [pathname, router]);

  if (checking || !session) {
    return (
      <main className="surface-grid min-h-dvh bg-[#07080d] p-6 text-white">
        <ViewSkeleton />
      </main>
    );
  }

  return <>{children}</>;
}
