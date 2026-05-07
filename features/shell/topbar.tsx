"use client";

import { Command, LogOut, Menu, PanelLeftOpen, Search } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";
import { viewFromPathname } from "@/lib/routes";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const viewCopy = {
  dashboard: ["Command Center", "Today's operating picture"],
  planner: ["Planner", "Shape the day before it shapes you"],
  calendar: ["Calendar", "Time-block the execution system"],
  roadmaps: ["Roadmaps", "Turn learning into phases"],
  projects: ["Launchpad", "Document proof-of-work"],
  dsa: ["Code Arena", "Solve, explain, revise, commit"],
  notes: ["Knowledge Base", "Capture reusable understanding"],
  health: ["Energy", "Protect the machine"],
  analytics: ["Analytics", "Read the patterns"],
  settings: ["Settings", "Tune the system"],
} as const;

export function Topbar() {
  const pathname = usePathname();
  const activeView = viewFromPathname(pathname);
  const { toggleSidebar, setCommandOpen, setMobileSidebarOpen, sidebarOpen } = useMoonstackStore();
  const [title, subtitle] = viewCopy[activeView];

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#07080d]/72 px-4 py-4 backdrop-blur-2xl md:px-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setMobileSidebarOpen(true)} className="rounded-xl border border-white/10 p-2 text-white/55 hover:bg-white/[0.06] lg:hidden">
          <Menu size={18} />
        </button>
        {!sidebarOpen && (
          <button onClick={toggleSidebar} className="rounded-xl border border-white/10 p-2 text-white/55 hover:bg-white/[0.06]">
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-sm text-white/40">{subtitle}</p>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button onClick={() => setCommandOpen(true)} className="min-w-[260px] justify-start text-white/38">
            <Search size={15} />
            Search or run command
            <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/30">Ctrl K</span>
          </Button>
          <Link href="/settings" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/65 transition hover:border-cyan-200/20 hover:bg-cyan-200/8 hover:text-white">
            Account
          </Link>
          <Button onClick={signOut} title="Sign out" className="px-3">
            <LogOut size={16} />
          </Button>
        </div>
        <button onClick={() => setCommandOpen(true)} className="rounded-xl border border-white/10 p-2 text-white/55 md:hidden">
          <Command size={18} />
        </button>
      </div>
    </header>
  );
}
