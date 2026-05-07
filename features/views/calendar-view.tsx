"use client";

import { Card, Badge } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

export function CalendarView() {
  const tasks = useMoonstackStore((state) => state.tasks);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Calendar Sync</h2>
        <p className="mt-2 text-sm text-white/42">Roadmap phases, planner tasks, and revision sessions appear as dated work blocks.</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const dayTasks = tasks.filter((task) => task.date === day);
          return (
            <Card key={day} className="min-h-48 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold">{day}</div>
                <Badge tone={dayTasks.length ? "mint" : "muted"}>{dayTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div key={task.id} className="rounded-xl bg-white/[0.035] p-3 text-sm text-white/68">{task.title}</div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

