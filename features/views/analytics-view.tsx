"use client";

import { Activity, Brain, Flame, GitCommitHorizontal, LineChart, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Badge, Card, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

export function AnalyticsView() {
  const { tasks, roadmaps, dsaProblems, projects, notes, healthLogs, xp, streak } = useMoonstackStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const solved = dsaProblems.filter((problem) => problem.status === "solved").length;
  const committed = dsaProblems.filter((problem) => problem.commitUrl).length;
  const doneTasks = tasks.filter((task) => task.done).length;
  const roadmapProgress = Math.round(
    roadmaps.reduce((sum, roadmap) => sum + roadmap.phases.reduce((phaseSum, phase) => phaseSum + phase.progress, 0) / Math.max(1, roadmap.phases.length), 0) / Math.max(1, roadmaps.length),
  );
  const projectProgress = Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(1, projects.length));
  const dsaProgress = Math.round((solved / Math.max(1, dsaProblems.length)) * 100);
  const plannerProgress = Math.round((doneTasks / Math.max(1, tasks.length)) * 100);
  const noteScore = Math.min(100, notes.length * 12);
  const energyScore = Math.min(100, healthLogs.length * 10 + Math.round((healthLogs[0]?.sleepHours || 0) * 5));

  const bars = [
    { name: "Roadmaps", value: roadmapProgress },
    { name: "DSA", value: dsaProgress },
    { name: "Projects", value: projectProgress },
    { name: "Planner", value: plannerProgress },
    { name: "Notes", value: noteScore },
    { name: "Energy", value: energyScore },
  ];
  const radar = bars.map((item) => ({ system: item.name, score: item.value }));
  const weakArea = [...bars].sort((a, b) => a.value - b.value)[0];
  const strongestArea = [...bars].sort((a, b) => b.value - a.value)[0];
  const insight = useMemo(() => {
    if (weakArea.name === "DSA") return "DSA is the current bottleneck. Add revision dates, solve one medium problem, and commit the explanation.";
    if (weakArea.name === "Roadmaps") return "Roadmap progress is low. Import a focused roadmap and sync only the next useful phase into Planner.";
    if (weakArea.name === "Energy") return "Energy tracking is thin. Add sleep, mood, water, and activity logs before increasing workload.";
    return `${weakArea.name} is behind ${strongestArea.name}. Keep the strong system, but schedule one recovery block for the weak one today.`;
  }, [strongestArea.name, weakArea.name]);
  const statCards = [
    { label: "XP", value: xp, icon: Target, tone: "mint" },
    { label: "Streak", value: streak, icon: Flame, tone: "amber" },
    { label: "Tasks Done", value: `${doneTasks}/${tasks.length}`, icon: Activity, tone: "blue" },
    { label: "DSA Proof", value: `${committed}/${dsaProblems.length}`, icon: GitCommitHorizontal, tone: "violet" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4">
            <Icon className="mb-3 text-white/40" size={18} />
            <div className="text-2xl font-bold">{value}</div>
            <div className="mt-1 text-sm text-white/38">{label}</div>
            <Badge tone={tone}>{label === "DSA Proof" ? "GitHub-ready" : "Live metric"}</Badge>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Operating System Score</h2>
              <p className="mt-2 text-sm text-white/42">Computed from tasks, roadmaps, DSA, projects, notes, and energy logs.</p>
            </div>
            <Badge tone="mint">{Math.round(bars.reduce((sum, item) => sum + item.value, 0) / bars.length)} overall</Badge>
          </div>
          <div className="h-96">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars}>
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,.42)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0b0d14", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16 }} />
                  <Bar dataKey="value" fill="#6ee7b7" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full rounded-3xl border border-white/[0.06] bg-white/[0.025]" />}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="font-semibold">Readiness Radar</h3>
              <p className="text-sm text-white/38">Balance across systems</p>
            </div>
          </div>
          <div className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid stroke="rgba(255,255,255,.12)" />
                  <PolarAngleAxis dataKey="system" tick={{ fill: "rgba(255,255,255,.45)", fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.22} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <div className="h-full rounded-3xl border border-white/[0.06] bg-white/[0.025]" />}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2"><LineChart size={18} className="text-emerald-200" /><h3 className="font-semibold">System Breakdown</h3></div>
          <div className="space-y-4">
            {bars.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex justify-between text-sm"><span className="text-white/55">{item.name}</span><span>{item.value}%</span></div>
                <Progress value={item.value} color={item.name === weakArea.name ? "var(--amber)" : "var(--mint)"} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <Badge tone="amber">AI-style Insight</Badge>
          <p className="mt-4 text-sm leading-7 text-white/66">{insight}</p>
          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-sm text-white/50">
            Weakest: <span className="text-amber-200">{weakArea.name}</span><br />
            Strongest: <span className="text-emerald-200">{strongestArea.name}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
