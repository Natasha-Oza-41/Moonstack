"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Sidebar } from "@/features/shell/navigation";
import { Topbar } from "@/features/shell/topbar";
import { CommandMenu } from "@/features/shell/command-menu";
import { SupabaseSync } from "@/features/shell/supabase-sync";
import { useMoonstackStore } from "@/store/moonstack-store";
import { ViewSkeleton } from "@/components/ui/primitives";
import type { ViewId } from "@/lib/types";

const loading = () => <ViewSkeleton />;

const views = {
  dashboard: dynamic(() => import("@/features/views/dashboard-view").then((mod) => mod.DashboardView), { loading }),
  planner: dynamic(() => import("@/features/views/planner-view").then((mod) => mod.PlannerView), { loading }),
  calendar: dynamic(() => import("@/features/views/calendar-view").then((mod) => mod.CalendarView), { loading }),
  roadmaps: dynamic(() => import("@/features/views/roadmaps-view").then((mod) => mod.RoadmapsView), { loading }),
  projects: dynamic(() => import("@/features/views/projects-view").then((mod) => mod.ProjectsView), { loading }),
  dsa: dynamic(() => import("@/features/views/dsa-view").then((mod) => mod.DsaView), { loading }),
  notes: dynamic(() => import("@/features/views/notes-view").then((mod) => mod.NotesView), { loading }),
  health: dynamic(() => import("@/features/views/health-view").then((mod) => mod.HealthView), { loading }),
  analytics: dynamic(() => import("@/features/views/analytics-view").then((mod) => mod.AnalyticsView), { loading }),
  settings: dynamic(() => import("@/features/views/settings-view").then((mod) => mod.SettingsView), { loading }),
};

type MoonstackAppProps = {
  routeView: ViewId;
  searchParams?: Record<string, string | string[] | undefined>;
};

export function MoonstackApp({ routeView }: MoonstackAppProps) {
  const setActiveView = useMoonstackStore((state) => state.setActiveView);
  const activeView = routeView;
  const ActiveView = views[activeView];

  useEffect(() => {
    setActiveView(routeView);
  }, [routeView, setActiveView]);

  return (
    <main className="surface-grid flex min-h-dvh bg-[#07080d] text-white">
      <Sidebar />
      <section className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <CommandMenu />
      <SupabaseSync />
    </main>
  );
}
