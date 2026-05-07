"use client";

import { Activity, ArrowUpRight, Brain, Flame, GitCommitHorizontal, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Badge, Card, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";
import { viewRoutes } from "@/lib/routes";

const velocity = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 44 },
  { day: "Wed", value: 41 },
  { day: "Thu", value: 58 },
  { day: "Fri", value: 63 },
  { day: "Sat", value: 72 },
  { day: "Sun", value: 68 },
];

const statCards = [
  { label: "XP", icon: Target, tone: "mint" },
  { label: "Streak", icon: Flame, tone: "amber" },
  { label: "Tasks Done", icon: Activity, tone: "blue" },
  { label: "DSA Solved", icon: Brain, tone: "violet" },
];

export function DashboardView() {
  const { tasks, roadmaps, dsaProblems, projects, xp, streak } = useMoonstackStore();
  const [mounted, setMounted] = useState(false);
  const done = tasks.filter((task) => task.done).length;
  const solved = dsaProblems.filter((problem) => problem.status === "solved").length;
  const roadmapProgress = Math.round(roadmaps[0].phases.reduce((sum, phase) => sum + phase.progress, 0) / roadmaps[0].phases.length);

  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute right-8 top-4 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative">
            <Badge tone="mint">Moonstack Command Center</Badge>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">Build proof every day without losing the map.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Roadmaps, DSA, projects, notes, GitHub, and health are connected into one execution loop.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {statCards.map(({ label, icon: Icon }) => {
                const value = label === "XP" ? xp : label === "Streak" ? streak : label === "Tasks Done" ? done : solved;
                return (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <Icon className="mb-3 text-white/40" size={18} />
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-white/36">{label}</div>
                </div>
              )})}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Today’s Focus</h3>
              <p className="text-sm text-white/38">Your clean execution list</p>
            </div>
            <Link href={viewRoutes.planner} className="text-emerald-200"><ArrowUpRight size={18} /></Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <div className="min-w-0">
                  <div className="text-sm text-white/82">{task.title}</div>
                  <div className="mt-1 text-xs text-white/34">{task.tag} · {task.priority}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Learning Velocity</h3>
              <p className="text-sm text-white/38">Tasks, commits, and study consistency</p>
            </div>
            <Badge tone="blue">+18% week</Badge>
          </div>
          <div className="h-64">
            {mounted ? <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocity}>
                <defs>
                  <linearGradient id="velocity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.36)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0b0d14", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16 }} />
                <Area type="monotone" dataKey="value" stroke="#6ee7b7" fill="url(#velocity)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer> : <div className="h-full rounded-3xl border border-white/[0.06] bg-white/[0.025]" />}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">System Health</h3>
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Roadmap</span><span>{roadmapProgress}%</span></div>
              <Progress value={roadmapProgress} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Projects</span><span>{projects[0].progress}%</span></div>
              <Progress value={projects[0].progress} color="var(--blue)" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Interview Readiness</span><span>{Math.round((solved / dsaProblems.length) * 100)}%</span></div>
              <Progress value={Math.round((solved / dsaProblems.length) * 100)} color="var(--amber)" />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-sm text-white/52">
              <GitCommitHorizontal className="mb-2 text-emerald-200" size={18} />
              Proof-of-work is strongest when each solved problem has an explanation and a commit.
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
