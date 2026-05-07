"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ViewId } from "@/lib/types";
import { MoonstackApp } from "@/features/shell/moonstack-app";
import { AuthGate } from "@/features/auth/auth-gate";

type MoonstackRouteAppProps = {
  view: ViewId;
  searchParams: Record<string, string | string[] | undefined>;
};

export function MoonstackRouteApp({ view, searchParams }: MoonstackRouteAppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <MoonstackApp routeView={view} searchParams={searchParams} />
      </AuthGate>
    </QueryClientProvider>
  );
}
