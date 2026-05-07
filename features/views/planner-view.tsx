"use client";

import { CheckCircle2, Circle, Clock3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, PrimaryButton } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

export function PlannerView() {
  const { tasks, selectedTaskIds, addTask, toggleTask, toggleTaskSelection, selectAllTasks, deleteSelectedTasks } = useMoonstackStore();
  const [title, setTitle] = useState("");
  const lanes = ["Now", "Next", "Later"];

  function submitTask(event: React.FormEvent) {
    event.preventDefault();
    addTask(title);
    setTitle("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">My Day</h2>
            <p className="text-sm text-white/38">Roadmap tasks, manual tasks, and completed work stay visible here.</p>
          </div>
          <form onSubmit={submitTask} className="flex min-w-[280px] gap-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-emerald-300/35" placeholder="Add a real task..." />
            <PrimaryButton type="submit"><Plus size={15} /> Add</PrimaryButton>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {lanes.map((lane, laneIndex) => (
            <div key={lane} className="rounded-3xl border border-white/[0.06] bg-black/18 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{lane}</h3>
                <span className="text-xs text-white/32">{tasks.filter((_, index) => index % 3 === laneIndex).length}</span>
              </div>
              <div className="space-y-3">
                {tasks.filter((_, index) => index % 3 === laneIndex).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 transition hover:bg-white/[0.05]">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleTask(task.id)} className="mt-0.5 text-left">
                        {task.done ? <CheckCircle2 className="text-emerald-200" size={18} /> : <Circle className="text-white/30" size={18} />}
                      </button>
                      <button onClick={() => toggleTask(task.id)} className="min-w-0 flex-1 text-left">
                        <div className={task.done ? "text-sm text-white/35 line-through" : "text-sm text-white/78"}>{task.title}</div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/34"><Clock3 size={13} /> {task.date} - {task.tag}</div>
                      </button>
                      <button onClick={() => toggleTaskSelection(task.id)} className={selectedTaskIds.includes(task.id) ? "text-emerald-200" : "text-white/28 hover:text-white/70"}>
                        <Circle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">Planner Controls</h3>
        <p className="mt-2 text-sm text-white/42">These controls now work and synced roadmap tasks are duplicate-protected.</p>
        <div className="mt-5 space-y-3">
          <button onClick={selectAllTasks} className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-white/66 hover:bg-white/[0.055]">
            {selectedTaskIds.length === tasks.length ? "Clear selection" : "Select all tasks"}
            <Circle size={16} />
          </button>
          <button onClick={deleteSelectedTasks} disabled={selectedTaskIds.length === 0} className="flex w-full items-center justify-between rounded-2xl border border-rose-400/14 bg-rose-400/5 p-4 text-sm text-rose-200/80 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40">
            Delete selected ({selectedTaskIds.length})
            <Trash2 size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}
