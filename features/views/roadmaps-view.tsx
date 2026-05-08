"use client";

import { BookOpen, Clapperboard, GitBranch, Link2, Plus, Rows3, Workflow } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

type RoadmapMode = "Timeline" | "Graph" | "Kanban";
type Roadmap = ReturnType<typeof useMoonstackStore.getState>["roadmaps"][number];

function slug(value: string) {
  return `roadmap-${value.toLowerCase().trim().replace(/https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom-roadmap"}`;
}

function extractUrls(value: string) {
  return Array.from(new Set(value.match(/https?:\/\/[^\s)]+/g) ?? []));
}

function weekLabel(index: number, totalDays: number) {
  const daysPerPhase = Math.max(1, Math.ceil(totalDays / Math.max(1, index + 1)));
  return `Days ${index * daysPerPhase + 1}-${Math.min(totalDays, (index + 1) * daysPerPhase)}`;
}

export function RoadmapsView() {
  const searchParams = useSearchParams();
  const { roadmaps, createRoadmapFromInput, addRoadmapTasksToPlanner } = useMoonstackStore();
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<RoadmapMode>("Timeline");
  const [activeRoadmapId, setActiveRoadmapId] = useState(roadmaps[0]?.id || "");
  const [activePhaseId, setActivePhaseId] = useState(roadmaps[0]?.phases[0]?.id || "");
  const [days, setDays] = useState(30);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const requestedRoadmap = searchParams.get("roadmap");
    if (requestedRoadmap && roadmaps.some((item) => item.id === requestedRoadmap)) setActiveRoadmapId(requestedRoadmap);
    if (!activeRoadmapId && roadmaps[0]) setActiveRoadmapId(roadmaps[0].id);
  }, [activeRoadmapId, roadmaps, searchParams]);

  const roadmap = roadmaps.find((item) => item.id === activeRoadmapId) || roadmaps[0];
  const activePhase = roadmap?.phases.find((phase) => phase.id === activePhaseId) || roadmap?.phases[0];
  const allTasks = useMemo(() => roadmap?.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.map((task) => ({ ...task, phase: phase.title, module: module.title })))) || [], [roadmap]);

  useEffect(() => {
    if (roadmap?.phases[0] && !roadmap.phases.some((phase) => phase.id === activePhaseId)) setActivePhaseId(roadmap.phases[0].id);
  }, [activePhaseId, roadmap]);

  function submitRoadmap(event: React.FormEvent) {
    event.preventDefault();
    const value = source.trim();
    if (!value) {
      setToast("Paste a roadmap link or a custom goal first.");
      return;
    }
    const nextId = slug(value);
    const existed = roadmaps.some((item) => item.id === nextId);
    createRoadmapFromInput(value);
    setActiveRoadmapId(nextId);
    setSource("");
    setToast(existed ? "Roadmap already existed. Selected it." : "Roadmap generated into weekly phases.");
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-5">
      {toast && <div className="toast-pop fixed right-5 top-5 z-50 rounded-2xl border border-emerald-300/20 bg-emerald-300/12 px-4 py-3 text-sm text-emerald-100 shadow-2xl">{toast}</div>}
      <section className="pastel-panel rounded-[1.35rem] p-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div>
            <Badge tone="violet">Roadmap phases</Badge>
            <h2 className="mt-3 text-3xl font-semibold">Choose a timeline, then open each phase.</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/42">The plan is distributed week-wise from the timeline you choose. Phase modules include theory links, video resources, practice and proof tasks.</p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <label className="grid gap-2 text-sm text-white/50">
                Complete in
                <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="soft-input rounded-xl px-3 py-2 outline-none">
                  {[14, 30, 45, 60, 90].map((item) => <option key={item} value={item}>{item} days</option>)}
                </select>
              </label>
              <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1">
                {[
                  ["Timeline", Rows3],
                  ["Graph", Workflow],
                  ["Kanban", GitBranch],
                ].map(([item, Icon]) => (
                  <button key={String(item)} onClick={() => setMode(item as RoadmapMode)} className={mode === item ? "rounded-lg bg-violet-300/14 px-3 py-2 text-violet-100" : "rounded-lg px-3 py-2 text-white/42 hover:text-white"}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <form onSubmit={submitRoadmap} className="grid gap-2">
            <textarea value={source} onChange={(event) => setSource(event.target.value)} className="soft-input min-h-[116px] rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-300/35" placeholder={"Paste roadmap.sh, YouTube, docs link, or custom goal\nExample: Learn backend in 45 days"} />
            <div className="flex gap-2">
              <Button type="submit"><Link2 size={15} /> Add source</Button>
              <PrimaryButton type="submit"><Plus size={15} /> Generate</PrimaryButton>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <aside className="pastel-panel quiet-scroll max-h-[720px] overflow-y-auto rounded-[1.35rem] p-4">
          <h3 className="px-1 font-semibold">Saved plans</h3>
          <div className="mt-4 space-y-2">
            {roadmaps.map((item) => (
              <button key={item.id} onClick={() => setActiveRoadmapId(item.id)} className={item.id === roadmap.id ? "w-full rounded-2xl border border-violet-300/25 bg-violet-300/12 p-4 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left hover:bg-white/[0.06]"}>
                <div className="font-medium">Week-wise plan</div>
                <div className="mt-1 truncate text-xs text-white/40">{item.source}</div>
                <div className="mt-2 text-xs text-white/34">{item.phases.length} phases</div>
              </button>
            ))}
          </div>
          <PrimaryButton className="mt-5 w-full" onClick={() => {
            addRoadmapTasksToPlanner(roadmap.id);
            setToast("Planner synced. Duplicate tasks skipped.");
          }}>Sync to planner</PrimaryButton>
        </aside>

        <div className="pastel-panel rounded-[1.35rem] p-5">
          {mode === "Timeline" && <Timeline roadmap={roadmap} days={days} activePhaseId={activePhase?.id || ""} setActivePhaseId={setActivePhaseId} />}
          {mode === "Graph" && <Graph roadmap={roadmap} days={days} />}
          {mode === "Kanban" && <Kanban tasks={allTasks} />}
          {activePhase && <PhaseDetail phase={activePhase} />}
        </div>
      </section>
    </div>
  );
}

function Timeline({ roadmap, days, activePhaseId, setActivePhaseId }: { roadmap: Roadmap; days: number; activePhaseId: string; setActivePhaseId: (id: string) => void }) {
  return (
    <div className="mb-6">
      <div className="flex gap-3 overflow-x-auto pb-3">
        {roadmap.phases.map((phase, index) => (
          <button key={phase.id} onClick={() => setActivePhaseId(phase.id)} className={activePhaseId === phase.id ? "min-w-[220px] rounded-2xl border border-cyan-200/35 bg-cyan-200/12 p-4 text-left" : "min-w-[220px] rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 text-left hover:bg-white/[0.06]"}>
            <Badge tone="blue">Phase {index + 1} - {weekLabel(index, days)}</Badge>
            <div className="mt-3 font-semibold">{phase.title.replace(/^Phase \d+\s*-\s*/i, "")}</div>
            <div className="mt-3"><Progress value={phase.progress} color="var(--cyan)" /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Graph({ roadmap, days }: { roadmap: Roadmap; days: number }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex min-w-[780px] items-center gap-5">
        {roadmap.phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center gap-5">
            <div className="w-56 rounded-3xl border border-violet-300/18 bg-violet-300/10 p-4">
              <Badge tone="violet">{weekLabel(index, days)}</Badge>
              <div className="mt-3 text-sm font-semibold">{phase.title.replace(/^Phase \d+\s*-\s*/i, "")}</div>
              <div className="mt-4"><Progress value={phase.progress} color="var(--violet)" /></div>
            </div>
            {index < roadmap.phases.length - 1 && <div className="h-px w-12 bg-violet-200/45" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Kanban({ tasks }: { tasks: Array<{ id: string; title: string; type: string; done: boolean; resources: string[]; phase: string; module: string }> }) {
  const columns = [
    ["Theory", tasks.filter((task) => task.type === "study")],
    ["Build", tasks.filter((task) => task.type === "project" || task.type === "github")],
    ["Practice", tasks.filter((task) => task.type === "revision" || task.type === "dsa")],
  ] as const;
  return <div className="mb-6 grid gap-4 lg:grid-cols-3">{columns.map(([title, items]) => <div key={title} className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-4"><h3 className="font-semibold">{title}</h3><div className="mt-3 space-y-3">{items.map((task) => <Task key={task.id} task={task} />)}</div></div>)}</div>;
}

function PhaseDetail({ phase }: { phase: Roadmap["phases"][number] }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5">
      <h3 className="text-xl font-semibold">{phase.title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/46">{phase.description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {phase.modules.map((module) => (
          <div key={module.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
            <h4 className="font-medium">{module.title}</h4>
            <div className="mt-4 space-y-3">{module.tasks.map((task) => <Task key={task.id} task={task} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Task({ task }: { task: { title: string; type: string; done: boolean; resources: string[] } }) {
  const isVideo = task.resources.some((resource) => /youtube|youtu\.be/i.test(resource));
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
      <div className="text-sm text-white/76">{task.title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={task.type === "study" ? "blue" : task.type === "project" ? "mint" : "amber"}>{task.type}</Badge>
        {task.resources.map((resource) => (
          <a key={resource} href={resource} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-blue-100/80">
            {isVideo ? <Clapperboard size={12} /> : <BookOpen size={12} />} resource
          </a>
        ))}
      </div>
    </div>
  );
}
