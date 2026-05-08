"use client";

import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge, Button, PrimaryButton } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

export function PlannerView() {
  const { tasks, selectedTaskIds, addTask, toggleTask, toggleTaskSelection, selectAllTasks, deleteSelectedTasks } = useMoonstackStore();
  const [title, setTitle] = useState("");
  const today = dayLabel(new Date());
  const groups = [
    { label: "Study foundation", match: (tag: string) => /roadmap|manual/i.test(tag), color: "var(--cyan)" },
    { label: "Build", match: (tag: string) => /github|project/i.test(tag), color: "var(--mint)" },
    { label: "Practice", match: (tag: string) => /dsa/i.test(tag), color: "var(--amber)" },
  ];

  function submitTask(event: React.FormEvent) {
    event.preventDefault();
    addTask(title);
    setTitle("");
  }

  return (
    <div className="space-y-5">
      <section className="pastel-panel rounded-[1.35rem] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="blue">{today}</Badge>
            <h2 className="mt-3 text-2xl font-semibold">Planner graph</h2>
            <p className="mt-1 text-sm text-white/42">Finish a foundation task, then connect it into build and practice work.</p>
          </div>
          <form onSubmit={submitTask} className="flex min-w-[280px] gap-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="soft-input min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-300/45" placeholder="Add focused task" />
            <PrimaryButton type="submit"><Plus size={15} /> Add</PrimaryButton>
          </form>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="pastel-panel quiet-scroll overflow-x-auto rounded-[1.35rem] p-5">
          <div className="flex min-w-[850px] items-start gap-6">
            {groups.map((group, groupIndex) => {
              const items = tasks.filter((task) => group.match(task.tag));
              return (
                <div key={group.label} className="relative flex flex-1 items-start gap-6">
                  <div className="min-w-[250px]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">{group.label}</h3>
                      <Badge tone="muted">{items.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {items.map((task, index) => (
                        <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleTask(task.id)} className="mt-0.5">
                              {task.done ? <CheckCircle2 className="text-emerald-200" size={18} /> : <Circle className="text-white/34" size={18} />}
                            </button>
                            <button onClick={() => toggleTask(task.id)} className="min-w-0 flex-1 text-left">
                              <div className={task.done ? "text-sm text-white/38 line-through" : "text-sm text-white/78"}>{task.title}</div>
                              <div className="mt-2 text-xs text-white/36">{task.date} - {task.priority}</div>
                            </button>
                            <button onClick={() => toggleTaskSelection(task.id)} className={selectedTaskIds.includes(task.id) ? "text-cyan-200" : "text-white/26 hover:text-white/70"}>
                              <Circle size={15} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      {!items.length && <div className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/38">No tasks in this step.</div>}
                    </div>
                  </div>
                  {groupIndex < groups.length - 1 && (
                    <div className="mt-16 flex h-20 w-20 shrink-0 items-center">
                      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${group.color}, ${groups[groupIndex + 1].color})` }} />
                      <div className="h-3 w-3 rounded-full" style={{ background: groups[groupIndex + 1].color }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pastel-panel rounded-[1.35rem] p-5">
          <h3 className="font-semibold">Actions</h3>
          <p className="mt-2 text-sm text-white/42">Use selection when you want to clean up finished or duplicate tasks.</p>
          <div className="mt-5 space-y-3">
            <Button onClick={selectAllTasks} className="w-full justify-between">
              {selectedTaskIds.length === tasks.length ? "Clear selection" : "Select all"}
              <Circle size={16} />
            </Button>
            <Button onClick={deleteSelectedTasks} disabled={selectedTaskIds.length === 0} className="w-full justify-between border-rose-400/16 bg-rose-400/8 text-rose-100">
              Delete selected ({selectedTaskIds.length})
              <Trash2 size={16} />
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}
