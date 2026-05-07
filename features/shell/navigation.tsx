"use client";

import {
  BarChart3,
  CalendarDays,
  FolderKanban,
  GitBranch,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  NotebookTabs,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/types";
import { useMoonstackStore } from "@/store/moonstack-store";
import { viewFromPathname, viewRoutes } from "@/lib/routes";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const nav: Array<{ id: ViewId; label: string; hint: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "dashboard", label: "Command", hint: "Mission control", icon: LayoutDashboard },
  { id: "planner", label: "Planner", hint: "Daily execution", icon: ListTodo },
  { id: "calendar", label: "Calendar", hint: "Time map", icon: CalendarDays },
  { id: "roadmaps", label: "Roadmaps", hint: "Learning paths", icon: GitBranch },
  { id: "projects", label: "Launchpad", hint: "Proof of work", icon: FolderKanban },
  { id: "dsa", label: "Code Arena", hint: "Interview prep", icon: NotebookTabs },
  { id: "notes", label: "Knowledge Base", hint: "Reusable understanding", icon: Sparkles },
  { id: "health", label: "Energy", hint: "Recovery loop", icon: HeartPulse },
  { id: "analytics", label: "Analytics", hint: "System signals", icon: BarChart3 },
  { id: "settings", label: "Settings", hint: "Preferences", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeView = viewFromPathname(pathname);
  const { sidebarOpen, mobileSidebarOpen, toggleSidebar, setMobileSidebarOpen, xp, streak } = useMoonstackStore();

  return (
    <>
      <motion.aside
        animate={{ width: sidebarOpen ? 304 : 86 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="hidden shrink-0 overflow-hidden border-r border-white/[0.08] bg-black/28 backdrop-blur-2xl lg:block"
      >
        <SidebarContent
          activeView={activeView}
          expanded={sidebarOpen}
          xp={xp}
          streak={streak}
          onToggle={toggleSidebar}
        />
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/58 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              drag="x"
              dragConstraints={{ left: -320, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -90 || info.velocity.x < -420) setMobileSidebarOpen(false);
              }}
              initial={{ x: -330, opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -330, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[304px] border-r border-white/[0.08] bg-[#07080d]/92 backdrop-blur-2xl lg:hidden"
            >
              <SidebarContent
                activeView={activeView}
                expanded
                xp={xp}
                streak={streak}
                onToggle={() => setMobileSidebarOpen(false)}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  activeView,
  expanded,
  xp,
  streak,
  onToggle,
  onNavigate,
}: {
  activeView: ViewId;
  expanded: boolean;
  xp: number;
  streak: number;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const settings = useMoonstackStore((state) => state.settings);
  const [user, setUser] = useState<User | null>(null);
  const avatarUrl = typeof user?.user_metadata?.avatar_url === "string"
    ? user.user_metadata.avatar_url
    : typeof user?.user_metadata?.picture === "string"
      ? user.user_metadata.picture
      : "";
  const displayName = settings.displayName || user?.user_metadata?.full_name || user?.user_metadata?.name || "Moonstack user";
  const accountEmail = settings.gmail || user?.email || "Signed in";

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className={cn("sticky top-0 flex h-dvh flex-col p-4", expanded ? "w-[304px]" : "w-[86px]")}>
      <div className={cn("mb-5 flex items-center gap-3", expanded ? "px-2" : "justify-center")}>
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cyan-200/20 bg-cyan-200/10 shadow-[0_0_34px_rgba(103,232,249,.12)]">
          <img src="/moonstack.svg" alt="Moonstack" className="h-10 w-10" />
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="min-w-0">
              <div className="font-semibold tracking-tight">Moonstack</div>
              <div className="text-xs text-white/38">Personal mission control</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onToggle} className={cn("rounded-xl p-2 text-white/35 transition hover:bg-white/[0.06] hover:text-white", expanded ? "ml-auto" : "hidden")}>
          <PanelLeftClose size={18} />
        </button>
      </div>

      <nav className="space-y-1.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <motion.div key={item.id} whileHover={{ x: expanded ? 3 : 0, scale: 1.01 }} whileTap={{ scale: 0.985 }}>
              <Link
                href={viewRoutes[item.id]}
                onClick={onNavigate}
                title={expanded ? undefined : item.label}
                className={cn(
                  "group relative flex w-full items-center overflow-hidden rounded-2xl text-left text-sm transition",
                  expanded ? "gap-3 px-3 py-3" : "justify-center px-0 py-3",
                  active ? "text-white" : "text-white/44 hover:bg-white/[0.045] hover:text-white/76",
                )}
              >
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl border border-cyan-200/18 bg-white/[0.075] shadow-[0_0_28px_rgba(103,232,249,.08),inset_0_1px_0_rgba(255,255,255,.07)]" />}
                <span className={cn("relative", active ? "text-cyan-100" : "text-white/36 group-hover:text-white/70")}>
                  <Icon size={18} />
                </span>
                {expanded && (
                  <>
                    <span className="relative min-w-0">
                      <span className="block font-medium">{item.label}</span>
                      <span className="block text-xs text-white/30">{item.hint}</span>
                    </span>
                    {active && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.75)]" />}
                  </>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {expanded ? (
          <>
            <Link href="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 transition hover:border-cyan-200/18 hover:bg-white/[0.055]">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-cyan-200/10 text-sm font-semibold text-cyan-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  displayName.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white/86">{displayName}</div>
                <div className="truncate text-xs text-white/36">{accountEmail}</div>
              </div>
            </Link>
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Momentum</div>
              <div className="grid grid-cols-2 gap-2">
                <MomentumTile value={xp} label="XP" tone="text-cyan-100" />
                <MomentumTile value={streak} label="streak" tone="text-lime-100" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-sm text-white/50">
              One solved problem, one clean note, one visible commit.
            </div>
          </>
        ) : (
          <button onClick={onToggle} className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/18 bg-black/55 text-cyan-100 transition hover:bg-cyan-200/10">
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function MomentumTile({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn("text-xl font-bold", tone)}>
        {value}
      </motion.div>
      <div className="text-xs text-white/35">{label}</div>
    </div>
  );
}
