"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

function label(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export function CalendarView() {
  const { tasks, xp } = useMoonstackStore();
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));
  const days = useMemo(() => Array.from({ length: 42 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 20 + index);
    return date.toISOString().slice(0, 10);
  }), []);
  const selectedTasks = tasks.filter((task) => task.date === selected);
  const completed = selectedTasks.filter((task) => task.done);
  const brownie = completed.length * 10;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="pastel-panel rounded-[1.35rem] p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Achievement heatmap</h2>
            <p className="mt-1 text-sm text-white/42">Click any day to see what was completed and how many brownie points it earned.</p>
          </div>
          <Badge tone="mint">{xp} total XP</Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = tasks.filter((task) => task.date === day);
            const done = dayTasks.filter((task) => task.done).length;
            const intensity = done >= 3 ? "bg-emerald-200 shadow-[0_0_18px_rgba(110,231,183,.35)]" : done === 2 ? "bg-emerald-200/70" : done === 1 ? "bg-emerald-200/38" : "bg-white/[0.055]";
            return (
              <button key={day} onClick={() => setSelected(day)} title={`${label(day)}: ${done} done`} className={`aspect-square rounded-xl border text-xs transition hover:scale-[1.03] ${selected === day ? "border-cyan-200/60" : "border-white/[0.06]"} ${intensity}`}>
                <span className="sr-only">{label(day)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="pastel-panel rounded-[1.35rem] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={completed.length ? "mint" : "muted"}>{completed.length} achievements</Badge>
            <h3 className="mt-3 text-xl font-semibold">{label(selected)}</h3>
          </div>
          <Button onClick={() => setSelected(new Date().toISOString().slice(0, 10))} className="px-3"><X size={15} /></Button>
        </div>
        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <div className="text-3xl font-bold text-emerald-100">+{brownie}</div>
          <div className="mt-1 text-sm text-white/42">brownie points from completed work</div>
        </div>
        <div className="mt-5 space-y-3">
          {selectedTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">
              <div className={task.done ? "text-sm text-white/76" : "text-sm text-white/46"}>{task.title}</div>
              <div className="mt-2 text-xs text-white/34">{task.done ? "Achieved" : "Pending"} - {task.tag}</div>
            </div>
          ))}
          {!selectedTasks.length && <div className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/40">No logged work for this date.</div>}
        </div>
      </aside>
    </div>
  );
}
