"use client";

import { GitBranch, Link2, Plus, Rows3, Workflow } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

type RoadmapMode = "Timeline" | "Graph" | "Kanban";

function slug(value: string) {
  return `roadmap-${value.toLowerCase().trim().replace(/https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom-roadmap"}`;
}

function extractUrls(value: string) {
  return Array.from(new Set(value.match(/https?:\/\/[^\s)]+/g) ?? []));
}

export function RoadmapsView() {
  const searchParams = useSearchParams();
  const { roadmaps, createRoadmapFromInput, addRoadmapTasksToPlanner } = useMoonstackStore();
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<RoadmapMode>("Timeline");
  const [activeRoadmapId, setActiveRoadmapId] = useState(roadmaps[0]?.id || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const requestedRoadmap = searchParams.get("roadmap");
    if (requestedRoadmap && roadmaps.some((item) => item.id === requestedRoadmap)) {
      setActiveRoadmapId(requestedRoadmap);
      return;
    }
    if (!roadmaps.length) return;
    if (!activeRoadmapId || !roadmaps.some((item) => item.id === activeRoadmapId)) {
      setActiveRoadmapId(roadmaps[0].id);
    }
  }, [activeRoadmapId, roadmaps, searchParams]);

  const roadmap = roadmaps.find((item) => item.id === activeRoadmapId) || roadmaps[0];
  const allTasks = useMemo(() => roadmap?.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.map((task) => ({ ...task, phase: phase.title, module: module.title })))) || [], [roadmap]);
  const sourceUrls = useMemo(() => extractUrls(source), [source]);

  function submitRoadmap(event: React.FormEvent) {
    event.preventDefault();
    const value = source.trim();
    if (!value) {
      setMessage("Paste a roadmap.sh link, docs link, YouTube link, or custom roadmap text first.");
      return;
    }
    const nextId = slug(value);
    const existed = roadmaps.some((item) => item.id === nextId);
    createRoadmapFromInput(value);
    setActiveRoadmapId(nextId);
    setSource("");
    setMessage(existed ? "That roadmap was already saved. I selected it instead of duplicating it." : "Roadmap added and selected. Sync it to Planner when ready.");
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="violet">Roadmap Engine</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Paste a link or plan. Moonstack turns it into phases.</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/42">roadmap.sh links, docs, YouTube playlists, GitHub repos, markdown, and custom text become stored roadmap cards.</p>
          </div>
          <form onSubmit={submitRoadmap} className="grid min-w-[320px] gap-2">
            <textarea value={source} onChange={(event) => setSource(event.target.value)} className="min-h-[112px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-violet-300/35" placeholder={"Paste roadmap.sh link, YouTube/docs/GitHub links, markdown headings, or a custom roadmap goal...\n# Phase 1 Foundations\nhttps://roadmap.sh/frontend"} />
            {sourceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-xl border border-blue-300/12 bg-blue-300/5 p-2">
                {sourceUrls.map((url) => <span key={url} className="max-w-full truncate rounded-lg bg-black/20 px-2 py-1 text-xs text-blue-100/70">{url}</span>)}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit"><Link2 size={15} /> Import link</Button>
              <PrimaryButton type="submit"><Plus size={15} /> Generate roadmap</PrimaryButton>
            </div>
            {message && <div className="rounded-xl border border-violet-300/14 bg-violet-300/8 px-3 py-2 text-xs text-violet-100/78">{message}</div>}
          </form>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <h3 className="font-semibold">Stored roadmaps</h3>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {roadmaps.map((item) => (
              <button key={item.id} onClick={() => setActiveRoadmapId(item.id)} className={item.id === roadmap.id ? "w-full rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left hover:bg-white/[0.05]"}>
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 truncate text-xs text-white/38">{item.source}</div>
                <div className="mt-2 text-xs text-white/32">{item.phases.length} phases - {item.phases.flatMap((phase) => phase.modules).length} modules - {item.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.flatMap((task) => task.resources))).length} links</div>
              </button>
            ))}
          </div>
          <PrimaryButton className="mt-5 w-full" onClick={() => {
            addRoadmapTasksToPlanner(roadmap.id);
            setMessage("Planner synced. Duplicate tasks are skipped automatically.");
          }}>Sync tasks to planner</PrimaryButton>
          <p className="mt-3 text-xs text-white/35">Sync is safe to click again. Already-added tasks are skipped.</p>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{roadmap.title}</h3>
              <p className="mt-1 text-sm text-white/38">{roadmap.source}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMode("Timeline")} className={mode === "Timeline" ? "border-violet-300/20 bg-violet-300/10 text-violet-100" : ""}><Rows3 size={15} /> Timeline</Button>
              <Button onClick={() => setMode("Graph")} className={mode === "Graph" ? "border-violet-300/20 bg-violet-300/10 text-violet-100" : ""}><Workflow size={15} /> Graph</Button>
              <Button onClick={() => setMode("Kanban")} className={mode === "Kanban" ? "border-violet-300/20 bg-violet-300/10 text-violet-100" : ""}><GitBranch size={15} /> Kanban</Button>
            </div>
          </div>

          {roadmap.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.flatMap((task) => task.resources))).length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-blue-300/12 bg-blue-300/5 p-3">
              {Array.from(new Set(roadmap.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.flatMap((task) => task.resources))))).map((resource) => (
                <a key={resource} href={resource} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-xl border border-blue-300/14 bg-black/20 px-3 py-2 text-xs text-blue-100/78 hover:bg-blue-300/10">
                  {resource}
                </a>
              ))}
            </div>
          )}

          {mode === "Timeline" && <TimelineView roadmap={roadmap} />}
          {mode === "Graph" && <GraphView roadmap={roadmap} />}
          {mode === "Kanban" && <KanbanView tasks={allTasks} />}
        </Card>
      </div>
    </div>
  );
}

function TimelineView({ roadmap }: { roadmap: ReturnType<typeof useMoonstackStore.getState>["roadmaps"][number] }) {
  return (
    <div className="space-y-5">
      {roadmap.phases.map((phase) => (
        <div key={phase.id} className="rounded-3xl border border-white/[0.06] bg-black/18 p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{phase.title}</h3>
              <p className="mt-1 text-sm text-white/42">{phase.description}</p>
            </div>
            <div className="min-w-[140px]">
              <Badge tone="blue">{phase.duration}</Badge>
              <div className="mt-3"><Progress value={phase.progress} color="var(--violet)" /></div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {phase.modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <h4 className="font-medium">{module.title}</h4>
                <div className="mt-3 space-y-2">
                  {module.tasks.map((task) => <TaskCard key={task.id} task={task} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GraphView({ roadmap }: { roadmap: ReturnType<typeof useMoonstackStore.getState>["roadmaps"][number] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/[0.06] bg-black/18 p-5">
      <div className="flex min-w-[720px] items-center gap-5">
        {roadmap.phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center gap-5">
            <div className="w-56 rounded-3xl border border-violet-300/18 bg-violet-300/8 p-4">
              <div className="text-sm font-semibold">{phase.title}</div>
              <div className="mt-2 text-xs text-white/42">{phase.modules.length} modules</div>
              <div className="mt-4"><Progress value={phase.progress} color="var(--violet)" /></div>
            </div>
            {index < roadmap.phases.length - 1 && <div className="h-px w-12 bg-violet-200/35" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView({ tasks }: { tasks: Array<{ id: string; title: string; type: string; done: boolean; resources: string[]; phase: string; module: string }> }) {
  const columns = [
    ["Study", tasks.filter((task) => task.type === "study")],
    ["Build", tasks.filter((task) => task.type === "project" || task.type === "github")],
    ["Revise", tasks.filter((task) => task.type === "revision" || task.type === "dsa")],
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map(([column, items]) => (
        <div key={column} className="rounded-3xl border border-white/[0.06] bg-black/18 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{column}</h3>
            <span className="text-xs text-white/32">{items.length}</span>
          </div>
          <div className="space-y-3">
            {items.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task }: { task: { title: string; type: string; done: boolean; resources: string[] } }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <div className="text-sm text-white/76">{task.title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone={task.done ? "mint" : "muted"}>{task.type}</Badge>
        {task.resources.map((resource) => (
          <a key={resource} href={resource} target="_blank" rel="noreferrer" className="text-xs text-blue-200/75">open resource</a>
        ))}
      </div>
    </div>
  );
}
