"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMoonstackStore } from "@/store/moonstack-store";
import type { ViewId } from "@/lib/types";
import { viewRoutes } from "@/lib/routes";

const commands: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "planner", label: "Open Daily Planner", hint: "Plan today" },
  { id: "roadmaps", label: "Open Roadmaps", hint: "Generate phases" },
  { id: "dsa", label: "Open DSA OS", hint: "Solve and commit" },
  { id: "projects", label: "Open Builder OS", hint: "Ship proof" },
  { id: "notes", label: "Open Second Brain", hint: "Capture notes" },
];

export function CommandMenu() {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useMoonstackStore();
  const [query, setQuery] = useState("");
  const visibleCommands = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return commands.filter((command) => !needle || `${command.label} ${command.hint}`.toLowerCase().includes(needle));
  }, [query]);

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="glass mx-auto mt-24 max-w-2xl overflow-hidden rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <Search size={18} className="text-white/40" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jump to a system..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/28" />
            </div>
            <div className="p-2">
              {visibleCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => {
                    setCommandOpen(false);
                    router.push(viewRoutes[command.id]);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/[0.055]"
                >
                  <span className="font-medium text-white/84">{command.label}</span>
                  <span className="text-xs text-white/34">{command.hint}</span>
                </button>
              ))}
              {visibleCommands.length === 0 && <div className="px-4 py-6 text-sm text-white/38">No command found.</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
